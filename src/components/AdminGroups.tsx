"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  X,
  ExternalLink,
  Users,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Trash2,
  Radio,
} from "lucide-react";
import {
  approveGroup,
  rejectGroup,
  deleteGroupAsAdmin,
} from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { categoryMeta, type Group, type GroupStatus } from "@/lib/types";

const TABS: { key: GroupStatus; label: string; Icon: typeof Clock }[] = [
  { key: "pending", label: "Pendientes", Icon: Clock },
  { key: "approved", label: "Aprobados", Icon: CheckCircle2 },
  { key: "rejected", label: "Rechazados", Icon: XCircle },
];

export function AdminGroups({ initial }: { initial: Group[] }) {
  const [groups, setGroups] = useState(initial);
  const [tab, setTab] = useState<GroupStatus>("pending");
  const [live, setLive] = useState(false);
  const [, startTransition] = useTransition();
  const { toast } = useToast();
  const confirm = useConfirm();

  // Mantiene una copia fresca para el manejador de realtime
  const groupsRef = useRef(groups);
  groupsRef.current = groups;

  // === Tiempo real: nuevos grupos / cambios / borrados sin recargar ===
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let active = true;

    (async () => {
      // Autenticar el Realtime con el token de la sesión para que la RLS
      // deje al admin recibir TODOS los cambios (incluidos los pendientes).
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (session) supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel("admin-groups")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "groups" },
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
        .subscribe((status) => setLive(status === "SUBSCRIBED"));
    })();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const counts = useMemo(
    () => ({
      pending: groups.filter((g) => g.status === "pending").length,
      approved: groups.filter((g) => g.status === "approved").length,
      rejected: groups.filter((g) => g.status === "rejected").length,
    }),
    [groups],
  );

  const visible = groups.filter((g) => g.status === tab);

  function updateStatus(id: string, status: GroupStatus) {
    const prev = groups;
    setGroups((g) => g.map((x) => (x.id === id ? { ...x, status } : x)));
    startTransition(async () => {
      const res =
        status === "approved" ? await approveGroup(id) : await rejectGroup(id);
      if (res?.error) {
        setGroups(prev);
        toast(res.error, "error");
      } else {
        toast(
          status === "approved"
            ? "Grupo aprobado. Ya es visible para todos."
            : "Grupo rechazado.",
          status === "approved" ? "success" : "info",
        );
      }
    });
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Borrar grupo",
      description: "Se eliminará permanentemente. Esta acción no se puede deshacer.",
      confirmText: "Borrar",
      danger: true,
    });
    if (!ok) return;

    const prev = groups;
    setGroups((g) => g.filter((x) => x.id !== id));
    startTransition(async () => {
      const res = await deleteGroupAsAdmin(id);
      if (res?.error) {
        setGroups(prev);
        toast(res.error, "error");
      } else {
        toast("Grupo borrado.", "success");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Pestañas + indicador en vivo */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {label}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  active ? "bg-white/20" : "bg-border text-foreground"
                }`}
              >
                {counts[key]}
              </span>
            </button>
          );
        })}
        <span
          className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-muted"
          title={live ? "Actualizaciones en tiempo real activas" : "Conectando…"}
        >
          <Radio
            size={14}
            className={live ? "text-accent" : "text-muted"}
          />
          <span className="hidden sm:inline">
            {live ? "En vivo" : "Conectando…"}
          </span>
          {live && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
          )}
        </span>
      </div>

      {/* Lista */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Inbox size={38} className="text-muted" />
          <p className="font-medium">Nada por aquí</p>
          <p className="text-sm text-muted">
            No hay grupos en estado &ldquo;{TABS.find((t) => t.key === tab)?.label}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {visible.map((g) => (
              <motion.div
                key={g.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center"
              >
                {/* Miniatura */}
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  {g.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.image_url}
                      alt={g.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className={`grid h-full w-full place-items-center bg-gradient-to-br ${categoryMeta(g.category).gradient}`}
                    >
                      <Users size={20} className="text-white/90" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{g.name}</h3>
                    <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                      {categoryMeta(g.category).short}
                    </span>
                  </div>
                  {g.description && (
                    <p className="line-clamp-1 text-sm text-muted">
                      {g.description}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <a
                      href={g.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1 text-accent hover:underline"
                    >
                      <ExternalLink size={12} /> Ver enlace
                    </a>
                    {(g.canton || g.province) && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} />{" "}
                        {[g.canton, g.province].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {g.members_hint ? (
                      <span className="inline-flex items-center gap-1">
                        <Users size={12} /> {g.members_hint.toLocaleString("es-EC")}
                      </span>
                    ) : null}
                    <span>
                      {new Date(g.created_at).toLocaleDateString("es-EC", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex shrink-0 gap-2">
                  {g.status !== "approved" && (
                    <button
                      onClick={() => updateStatus(g.id, "approved")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
                    >
                      <Check size={16} /> Aprobar
                    </button>
                  )}
                  {g.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(g.id, "rejected")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-red-500 hover:text-red-600"
                    >
                      <X size={16} /> Rechazar
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-2.5 py-2 text-muted transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                    aria-label="Borrar grupo"
                    title="Borrar permanentemente"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
