"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function useThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const explicit = document.documentElement.dataset.theme;
    const dark = explicit
      ? explicit === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(dark);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage no disponible
    }
    setIsDark(next);
  }

  return { mounted, isDark, toggle };
}

export function ThemeToggle({
  className = "",
  variant = "icon",
}: {
  className?: string;
  variant?: "icon" | "menu";
}) {
  const { mounted, isDark, toggle } = useThemeToggle();

  // Variante de fila completa (para el menú móvil): toda la fila es tocable.
  if (variant === "menu") {
    return (
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent-soft"
        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      >
        <span className="flex items-center gap-3">
          {mounted && isDark ? <Sun size={18} /> : <Moon size={18} />}
          {mounted ? (isDark ? "Modo claro" : "Modo oscuro") : "Tema"}
        </span>
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
          {mounted ? (isDark ? "Oscuro" : "Claro") : ""}
        </span>
      </button>
    );
  }

  // Variante ícono (navbar de escritorio).
  return (
    <button
      onClick={toggle}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent-soft ${className}`}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      {mounted ? (
        isDark ? (
          <Sun size={18} />
        ) : (
          <Moon size={18} />
        )
      ) : (
        <Moon size={18} className="opacity-0" />
      )}
    </button>
  );
}
