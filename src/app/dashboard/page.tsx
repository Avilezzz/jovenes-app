import { redirect } from "next/navigation";
import { PlusCircle, LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { GroupForm } from "@/components/GroupForm";
import { MyGroups } from "@/components/MyGroups";
import { SetupNotice } from "@/components/SetupNotice";
import { BackToHome } from "@/components/BackToHome";
import type { Group } from "@/lib/types";

export const metadata = { title: "Mi panel · Jóvenes en Acción" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!hasSupabaseConfig) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <SetupNotice />
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya protege esta ruta, pero reforzamos aquí.
  if (!user) redirect("/login?redirect=/dashboard");

  const { data } = await supabase
    .from("groups")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  const myGroups = (data as Group[]) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <BackToHome className="mb-5" />
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Mi panel</h1>
        <p className="text-muted">
          Hola, <span className="font-medium text-foreground">{user.email}</span>.
          Comparte y gestiona tus grupos.
        </p>
      </header>

      {/* Crear grupo */}
      <section className="mb-12 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <PlusCircle size={20} className="text-accent" />
          <h2 className="text-lg font-semibold">Publicar un nuevo grupo</h2>
        </div>
        <GroupForm />
      </section>

      {/* Mis grupos */}
      <section>
        <div className="mb-5 flex items-center gap-2">
          <LayoutGrid size={20} className="text-accent" />
          <h2 className="text-lg font-semibold">
            Mis grupos{" "}
            <span className="text-sm font-normal text-muted">
              ({myGroups.length}/15)
            </span>
          </h2>
        </div>
        <MyGroups initial={myGroups} userId={user.id} />
      </section>
    </div>
  );
}
