import { Suspense } from "react";
import { UserPlus } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { register } from "@/app/auth/actions";

export const metadata = { title: "Únete · Jóvenes en Acción" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-16rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-accent text-white shadow-sm">
          <UserPlus size={22} />
        </span>
        <h1 className="text-2xl font-bold">Únete a la comunidad</h1>
        <p className="text-sm text-muted">
          Crea tu cuenta para compartir grupos con otros beneficiarios.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <Suspense>
          <AuthForm mode="register" action={register} />
        </Suspense>
      </div>
    </div>
  );
}
