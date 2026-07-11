import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, LogIn, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { isCurrentUserAdmin } from "@/lib/admin";
import { LogoutButton } from "./LogoutButton";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import type { Notification } from "@/lib/types";

export async function Navbar() {
  let email: string | null = null;
  let userId: string | null = null;
  let isAdmin = false;
  let notifications: Notification[] = [];

  if (hasSupabaseConfig) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
    userId = user?.id ?? null;
    if (user) {
      isAdmin = await isCurrentUserAdmin();
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      notifications = (data as Notification[]) ?? [];
    }
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border">
            <Image
              src="/logo.png"
              alt="Jóvenes en Acción"
              width={36}
              height={36}
              priority
              className="h-full w-full object-cover"
            />
          </span>
          <span className="hidden sm:block leading-tight">
            Jóvenes en Acción
            <span className="block text-[11px] font-normal text-muted">
              Comunidad de grupos
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Campana: siempre visible si hay sesión */}
          {email && userId && (
            <NotificationBell initial={notifications} userId={userId} />
          )}

          {/* Toggle de tema (en escritorio; en móvil va dentro del menú) */}
          <ThemeToggle className="hidden sm:inline-flex" />

          {/* Acciones de escritorio */}
          <div className="hidden items-center gap-2 sm:flex">
            {email ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
                  >
                    <ShieldCheck size={16} />
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
                >
                  <LayoutDashboard size={16} />
                  Mi panel
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
                >
                  <LogIn size={16} />
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
                >
                  Únete
                </Link>
              </>
            )}
          </div>

          {/* Menú hamburguesa (móvil) */}
          <MobileMenu email={email} isAdmin={isAdmin} />
        </div>
      </nav>
    </header>
  );
}
