"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { AuthState } from "@/app/auth/actions";

type Props = {
  mode: "login" | "register";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : null}
      {pending ? "Procesando…" : label}
    </button>
  );
}

export function AuthForm({ mode, action }: Props) {
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const isLogin = mode === "login";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="redirect" value={redirect} />

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tucorreo@ejemplo.com"
            className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent/40"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Contraseña
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent/40"
          />
        </div>
      </div>

      {state.error && (
        <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={15} /> {state.error}
        </p>
      )}
      {state.message && (
        <p className="flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
          <CheckCircle2 size={15} /> {state.message}
        </p>
      )}

      <SubmitButton label={isLogin ? "Entrar" : "Crear cuenta"} />

      <p className="text-center text-sm text-muted">
        {isLogin ? (
          <>
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium text-accent hover:underline">
              Regístrate
            </Link>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Inicia sesión
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
