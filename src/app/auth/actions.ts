"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { authSchema } from "@/lib/validation";

export type AuthState = {
  error?: string;
  message?: string;
};

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!hasSupabaseConfig) {
    return { error: "Supabase no está configurado. Revisa .env.local" };
  }

  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  const redirectTo = (formData.get("redirect") as string) || "/dashboard";
  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!hasSupabaseConfig) {
    return { error: "Supabase no está configurado. Revisa .env.local" };
  }

  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return { error: error.message };
  }

  // Si Supabase requiere confirmación por correo, no habrá sesión todavía.
  if (data.user && !data.session) {
    return {
      message:
        "¡Cuenta creada! Revisa tu correo para confirmar tu cuenta y luego inicia sesión.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
