import { AlertTriangle } from "lucide-react";

// Se muestra solo si faltan las variables de entorno de Supabase.
export function SetupNotice() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-amber-500/50 bg-amber-500/5 py-16 text-center">
      <AlertTriangle className="text-amber-500" size={40} />
      <p className="font-semibold">Falta configurar Supabase</p>
      <p className="max-w-md text-sm text-muted">
        Añade <code className="rounded bg-border px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
        <code className="rounded bg-border px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en tu
        archivo <code className="rounded bg-border px-1.5 py-0.5">.env.local</code> y reinicia el
        servidor.
      </p>
    </div>
  );
}
