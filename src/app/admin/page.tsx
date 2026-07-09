import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { isCurrentUserAdmin } from "@/lib/admin";
import { AdminGroups } from "@/components/AdminGroups";
import { SetupNotice } from "@/components/SetupNotice";
import { BackToHome } from "@/components/BackToHome";
import type { Group } from "@/lib/types";

export const metadata = { title: "Panel de administración · Jóvenes en Acción" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
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

  if (!user) redirect("/login?redirect=/admin");
  if (!(await isCurrentUserAdmin())) redirect("/");

  // El admin ve todos los grupos (garantizado por RLS).
  const { data } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });
  const groups = (data as Group[]) ?? [];
  const pending = groups.filter((g) => g.status === "pending").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <BackToHome className="mb-5" />
      <header className="mb-8 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-sm">
          <ShieldCheck size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Panel de administración</h1>
          <p className="text-muted">
            {pending > 0 ? (
              <>
                Tienes{" "}
                <span className="font-semibold text-accent">
                  {pending} grupo{pending === 1 ? "" : "s"}
                </span>{" "}
                esperando revisión.
              </>
            ) : (
              "No hay grupos pendientes. ¡Todo al día! 🎉"
            )}
          </p>
        </div>
      </header>

      <AdminGroups initial={groups} />
    </div>
  );
}
