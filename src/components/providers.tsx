"use client";

import { ToastProvider } from "./ui/toast";
import { ConfirmProvider } from "./ui/confirm";

// Proveedores de UI global (toasts + diálogos de confirmación).
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );
}
