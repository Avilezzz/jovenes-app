// Configuración central de Supabase.
// Permite que la app arranque y compile aunque aún no existan las claves,
// mostrando un aviso amable en vez de romperse.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const hasSupabaseConfig =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
