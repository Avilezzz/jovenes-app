"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, HelpCircle } from "lucide-react";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx)
    throw new Error("useConfirm debe usarse dentro de <ConfirmProvider>");
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    setOpts(options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpts(null);
  }, []);

  const danger = opts?.danger;
  const Icon = danger ? AlertTriangle : HelpCircle;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {opts && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => close(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl"
              initial={{ scale: 0.95, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                    danger
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-accent-soft text-accent"
                  }`}
                >
                  <Icon size={20} />
                </span>
                <div className="pt-0.5">
                  <h3 className="font-semibold leading-tight">{opts.title}</h3>
                  {opts.description && (
                    <p className="mt-1.5 text-sm text-muted">
                      {opts.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => close(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  {opts.cancelText ?? "Cancelar"}
                </button>
                <button
                  onClick={() => close(true)}
                  autoFocus
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                    danger
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-accent hover:bg-accent-hover"
                  }`}
                >
                  {opts.confirmText ?? "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
