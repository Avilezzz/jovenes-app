"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; message: string; type: ToastType };
type ToastApi = { toast: (message: string, type?: ToastType) => void };

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}

const META: Record<
  ToastType,
  { Icon: typeof Info; color: string; ring: string }
> = {
  success: {
    Icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    ring: "border-emerald-500/30",
  },
  error: {
    Icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    ring: "border-red-500/30",
  },
  info: { Icon: Info, color: "text-accent", ring: "border-accent/30" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
        <AnimatePresence>
          {toasts.map((t) => {
            const { Icon, color, ring } = META[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border ${ring} bg-surface p-3.5 shadow-lg`}
              >
                <Icon size={18} className={`mt-0.5 shrink-0 ${color}`} />
                <p className="flex-1 text-sm leading-snug">{t.message}</p>
                <button
                  onClick={() => remove(t.id)}
                  className="text-muted transition-colors hover:text-foreground"
                  aria-label="Cerrar"
                >
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
