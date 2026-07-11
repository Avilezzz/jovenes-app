import Image from "next/image";
import Link from "next/link";
import { Sparkles, Plus, ShieldCheck, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { GroupGrid } from "@/components/GroupGrid";
import { SetupNotice } from "@/components/SetupNotice";
import type { Group } from "@/lib/types";

// Revalida cada 30s: rápido, cacheado y sin saturar la base de datos.
export const revalidate = 30;

async function getGroups(): Promise<Group[]> {
  if (!hasSupabaseConfig) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("groups")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(120);
  return (data as Group[]) ?? [];
}

export default async function Home() {
  const groups = await getGroups();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* ===== Hero ===== */}
      <section className="mt-8 grid items-center gap-8 lg:mt-14 lg:grid-cols-2 lg:gap-12">
        {/* Texto */}
        <div className="order-2 flex flex-col gap-5 lg:order-1">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-accent">
            <Sparkles size={13} /> Comunidad Ecuador 2026
          </span>
          <h1 className="text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            Encuentra tu grupo de WhatsApp de{" "}
            <span className="text-accent">Jóvenes en Acción</span>
          </h1>
          <p className="max-w-md text-muted sm:text-lg">
            Conéctate con otros beneficiarios: pasantías, trámites, estudio y
            ayuda mutua. Explora los grupos o comparte el tuyo con la comunidad.
          </p>
          <div className="mt-1 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
            >
              <Plus size={16} /> Compartir mi grupo
            </Link>
            <a
              href="#grupos"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent-soft"
            >
              Explorar grupos
            </a>
          </div>
        </div>

        {/* Banner limpio, protagonista */}
        <div className="relative order-1 lg:order-2">
          {/* Resplandor decorativo detrás */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-accent/25 via-accent/5 to-transparent blur-2xl"
          />
          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-xl ring-1 ring-black/5">
            <Image
              src="/banner.png"
              alt="Jóvenes en Acción"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ===== Franja de confianza ===== */}
      <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Seguro", text: "Enlaces verificados de WhatsApp y datos protegidos." },
          { icon: Zap, title: "Rápido", text: "Interfaz fluida y ligera, sin anuncios ni relleno." },
          { icon: Sparkles, title: "Comunitario", text: "Hecho por y para beneficiarios del programa." },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
              <Icon size={18} />
            </span>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-muted">{text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ===== Grupos ===== */}
      <section id="grupos" className="mt-12 scroll-mt-20 pb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Grupos de la comunidad</h2>
          <p className="text-muted">
            Toca <span className="font-medium text-accent">Unirme</span> para
            entrar. Para publicar el tuyo necesitas una cuenta.
          </p>
        </div>

        {!hasSupabaseConfig ? <SetupNotice /> : <GroupGrid groups={groups} />}
      </section>
    </div>
  );
}
