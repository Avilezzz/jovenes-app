"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { logout } from "@/app/auth/actions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground hover:bg-accent-soft disabled:opacity-50"
      aria-label="Cerrar sesión"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">{pending ? "Saliendo…" : "Salir"}</span>
    </button>
  );
}
