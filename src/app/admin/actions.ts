"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { isCurrentUserAdmin } from "@/lib/admin";
import type { GroupStatus } from "@/lib/types";

export type AdminActionResult = { error?: string; success?: boolean };

async function setStatus(
  id: string,
  status: GroupStatus,
): Promise<AdminActionResult> {
  if (!hasSupabaseConfig) return { error: "Supabase no está configurado." };

  // Defensa en profundidad: verificamos admin en el servidor.
  // (La RLS de Postgres también lo exige.)
  if (!(await isCurrentUserAdmin())) {
    return { error: "No autorizado." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("groups")
    .update({ status })
    .eq("id", id);

  if (error) return { error: "No se pudo actualizar el grupo." };

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function approveGroup(id: string) {
  return setStatus(id, "approved");
}

export async function rejectGroup(id: string) {
  return setStatus(id, "rejected");
}

export async function deleteGroupAsAdmin(
  id: string,
): Promise<AdminActionResult> {
  if (!hasSupabaseConfig) return { error: "Supabase no está configurado." };
  if (!(await isCurrentUserAdmin())) return { error: "No autorizado." };

  const supabase = await createClient();
  // La RLS (admin_borra) garantiza que solo un admin pueda borrar cualquiera.
  const { error } = await supabase.from("groups").delete().eq("id", id);
  if (error) return { error: "No se pudo borrar el grupo." };

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true };
}
