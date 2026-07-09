"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { GroupCard } from "./GroupCard";
import { deleteGroup } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import type { Group } from "@/lib/types";

export function MyGroups({
  initial,
  userId,
}: {
  initial: Group[];
  userId: string;
}) {
  const [groups, setGroups] = useState(initial);
  const [, startTransition] = useTransition();
  const { toast } = useToast();
  const confirm = useConfirm();

  // === Tiempo real: mis grupos nuevos y cambios de estado sin recargar ===
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let active = true;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (session) supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`my-groups-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "groups",
            filter: `owner_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as Group;
              setGroups((g) =>
                g.some((x) => x.id === row.id) ? g : [row, ...g],
              );
            } else if (payload.eventType === "UPDATE") {
              const row = payload.new as Group;
              setGroups((g) => g.map((x) => (x.id === row.id ? row : x)));
            } else if (payload.eventType === "DELETE") {
              const oldId = (payload.old as { id: string }).id;
              setGroups((g) => g.filter((x) => x.id !== oldId));
            }
          },
        )
        .subscribe();
    })();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId]);

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Eliminar grupo",
      description: "Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      danger: true,
    });
    if (!ok) return;

    // Optimista: lo quitamos de la vista al instante.
    const prev = groups;
    setGroups((g) => g.filter((x) => x.id !== id));
    startTransition(async () => {
      const res = await deleteGroup(id);
      if (res?.error) {
        setGroups(prev); // revertimos si falla
        toast(res.error, "error");
      } else {
        toast("Grupo eliminado.", "success");
      }
    });
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
        <Inbox size={38} className="text-muted" />
        <p className="font-medium">Aún no has publicado grupos</p>
        <p className="max-w-sm text-sm text-muted">
          Usa el formulario de arriba para compartir tu primer grupo con la
          comunidad.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <AnimatePresence mode="popLayout">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onDelete={handleDelete}
            showStatus
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
