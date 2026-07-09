import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

// Comprueba si el usuario actual es administrador.
// Usa la función is_admin() de Postgres (respaldada por la RLS de `admins`).
export async function isCurrentUserAdmin(): Promise<boolean> {
  if (!hasSupabaseConfig) return false;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return data === true;
}
