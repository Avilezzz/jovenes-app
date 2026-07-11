"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  XCircle,
  BellOff,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import type { Notification } from "@/lib/types";

// Máximo de notificaciones que mantenemos en memoria (coincide con el auto-límite de la BD).
const MAX_ITEMS = 50;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

export function NotificationBell({
  initial,
  userId,
}: {
  initial: Notification[];
  userId: string;
}) {
  const [items, setItems] = useState<Notification[]>(initial);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const unread = items.filter((n) => !n.read).length;

  // === Tiempo real: nuevas notificaciones sin recargar ===
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
        .channel(`notifs-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as Notification;
              setItems((prev) =>
                prev.some((n) => n.id === row.id)
                  ? prev
                  : [row, ...prev].slice(0, MAX_ITEMS),
              );
            } else if (payload.eventType === "UPDATE") {
              const row = payload.new as Notification;
              setItems((prev) => prev.map((n) => (n.id === row.id ? row : n)));
            } else if (payload.eventType === "DELETE") {
              const oldId = (payload.old as { id: string }).id;
              setItems((prev) => prev.filter((n) => n.id !== oldId));
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

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function markAllRead() {
    if (unread === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
  }

  async function deleteAll() {
    if (items.length === 0) return;
    const prev = items;
    setItems([]); // optimista
    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);
    if (error) {
      setItems(prev);
      toast("No se pudieron borrar las notificaciones.", "error");
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent-soft"
        aria-label="Notificaciones"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-3 top-16 z-[60] w-auto overflow-hidden rounded-2xl border border-border bg-surface shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-80"
          >
            {/* Cabecera con acciones */}
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <p className="font-semibold">Notificaciones</p>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-accent-soft hover:text-foreground"
                    title="Marcar todas como leídas"
                    aria-label="Marcar todas como leídas"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
                {items.length > 0 && (
                  <button
                    onClick={deleteAll}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-600 hover:text-white"
                    title="Borrar todas"
                    aria-label="Borrar todas las notificaciones"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <BellOff size={28} className="text-muted" />
                <p className="text-sm text-muted">Aún no tienes notificaciones.</p>
              </div>
            ) : (
              <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto sm:max-h-96">
                {items.map((n) => {
                  const approved = n.type === "approved";
                  return (
                    <li
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent-soft/40 ${
                        n.read ? "" : "bg-accent-soft/30"
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {approved ? (
                          <CheckCircle2 size={18} className="text-emerald-600" />
                        ) : (
                          <XCircle size={18} className="text-red-600" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug">
                          Tu grupo{" "}
                          <span className="font-semibold">{n.group_name}</span>{" "}
                          fue{" "}
                          <span
                            className={
                              approved ? "text-emerald-600" : "text-red-600"
                            }
                          >
                            {approved ? "aprobado ✅" : "rechazado"}
                          </span>
                          {approved ? " y ya es visible." : "."}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
