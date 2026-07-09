"use client";

import { motion } from "framer-motion";
import {
  MessageCircle,
  Users,
  ArrowUpRight,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
} from "lucide-react";
import { categoryMeta, type Group } from "@/lib/types";

const STATUS_META = {
  pending: { label: "En revisión", cls: "bg-amber-500/90", Icon: Clock },
  approved: { label: "Aprobado", cls: "bg-emerald-600/90", Icon: CheckCircle2 },
  rejected: { label: "Rechazado", cls: "bg-red-600/90", Icon: XCircle },
} as const;

export function GroupCard({
  group,
  onDelete,
  showStatus = false,
}: {
  group: Group;
  onDelete?: (id: string) => void;
  showStatus?: boolean;
}) {
  const meta = categoryMeta(group.category);
  const gradient = meta.gradient;
  const status = STATUS_META[group.status];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Cabecera / imagen */}
      <div className="relative h-28 overflow-hidden">
        {group.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={group.image_url}
            alt={group.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            <Users className="text-white/90" size={30} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          {meta.short}
        </span>
        {showStatus && status && (
          <span
            className={`absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full ${status.cls} px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur`}
          >
            <status.Icon size={12} />
            {status.label}
          </span>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(group.id)}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/35 text-white backdrop-blur transition-colors hover:bg-red-600"
            aria-label="Eliminar grupo"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-semibold leading-tight">
          {group.name}
        </h3>
        {group.description && (
          <p className="line-clamp-2 text-sm text-muted">{group.description}</p>
        )}

        {(group.canton || group.province) && (
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <MapPin size={13} className="text-accent" />
            {[group.canton, group.province].filter(Boolean).join(", ")}
          </span>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          {group.members_hint ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Users size={13} />
              {group.members_hint.toLocaleString("es-EC")} miembros
            </span>
          ) : (
            <span />
          )}

          <a
            href={group.whatsapp_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
          >
            <MessageCircle size={15} />
            Unirme
            <ArrowUpRight size={14} className="opacity-80" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
