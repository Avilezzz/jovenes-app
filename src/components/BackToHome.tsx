import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Enlace de regreso a la página principal (para páginas internas).
export function BackToHome({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex w-fit items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-accent/40 hover:text-foreground ${className}`}
    >
      <ArrowLeft size={16} />
      Ir al inicio
    </Link>
  );
}
