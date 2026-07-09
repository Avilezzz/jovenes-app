"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import { logout } from "@/app/auth/actions";
import { ThemeToggle } from "./ThemeToggle";

export function MobileMenu({
  email,
  isAdmin,
}: {
  email: string | null;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const close = () => setOpen(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent-soft"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Fondo */}
            <motion.div
              className="fixed inset-0 top-16 z-40 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            {/* Panel */}
            <motion.div
              className="absolute inset-x-0 top-16 z-50 border-b border-border bg-surface p-4 shadow-lg"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <nav className="flex flex-col gap-1">
                {email ? (
                  <>
                    <div className="px-3 pb-2 text-xs text-muted">{email}</div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={close}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
                      >
                        <ShieldCheck size={18} /> Panel de administración
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      onClick={close}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent-soft"
                    >
                      <LayoutDashboard size={18} /> Mi panel
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={close}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent-soft"
                    >
                      <LogIn size={18} /> Entrar
                    </Link>
                    <Link
                      href="/register"
                      onClick={close}
                      className="flex items-center gap-3 rounded-lg bg-accent px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
                    >
                      <UserPlus size={18} /> Únete
                    </Link>
                  </>
                )}

                <div className="my-1 h-px bg-border" />

                {/* Tema (fila completa tocable) */}
                <ThemeToggle variant="menu" />

                {email && (
                  <button
                    onClick={() => {
                      close();
                      startTransition(() => logout());
                    }}
                    disabled={pending}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted transition-colors hover:bg-accent-soft hover:text-foreground disabled:opacity-50"
                  >
                    <LogOut size={18} /> {pending ? "Saliendo…" : "Cerrar sesión"}
                  </button>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
