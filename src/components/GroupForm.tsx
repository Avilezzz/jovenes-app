"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Loader2,
  AlertCircle,
  ImagePlus,
  Link2,
  Type,
  Tag,
  Users,
  MapPin,
  Building2,
  X,
} from "lucide-react";
import { createGroup, type GroupState } from "@/app/dashboard/actions";
import { CATEGORIES, categoryMeta } from "@/lib/types";
import { PROVINCES, cantonsOf } from "@/lib/ecuador-dpa";
import { useToast } from "@/components/ui/toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : null}
      {pending ? "Publicando…" : "Publicar grupo"}
    </button>
  );
}

const inputBase =
  "w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent/40";

export function GroupForm() {
  const [state, formAction] = useActionState<GroupState, FormData>(
    createGroup,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [province, setProvince] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setPreview(null);
      setProvince("");
      toast(
        "¡Grupo enviado! Un administrador lo revisará antes de publicarlo.",
        "success",
      );
    }
  }, [state.success, toast]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {/* Nombre */}
      <div className="relative">
        <Type size={16} className="absolute left-3.5 top-3.5 text-muted" />
        <input
          name="name"
          required
          minLength={3}
          maxLength={60}
          placeholder="Nombre del grupo (ej: Pasantías Guayas 2026)"
          className={inputBase}
        />
      </div>

      {/* Categoría + miembros */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative">
          <Tag size={16} className="absolute left-3.5 top-3.5 text-muted" />
          <select name="category" defaultValue="General" className={`${inputBase} appearance-none`}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {categoryMeta(c).full}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Users size={16} className="absolute left-3.5 top-3.5 text-muted" />
          <input
            name="members_hint"
            type="number"
            min={0}
            max={100000}
            placeholder="Nº de miembros (opcional)"
            className={inputBase}
          />
        </div>
      </div>

      {/* Provincia + Cantón (en cascada) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative">
          <MapPin size={16} className="absolute left-3.5 top-3.5 text-muted" />
          <select
            name="province"
            required
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className={`${inputBase} appearance-none ${province ? "" : "text-muted"}`}
          >
            <option value="">Provincia…</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p} className="text-foreground">
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Building2 size={16} className="absolute left-3.5 top-3.5 text-muted" />
          <select
            name="canton"
            required
            disabled={!province}
            defaultValue=""
            key={province} /* reinicia el cantón al cambiar de provincia */
            className={`${inputBase} appearance-none disabled:opacity-50`}
          >
            <option value="">
              {province ? "Cantón…" : "Elige provincia primero"}
            </option>
            {cantonsOf(province).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enlace WhatsApp */}
      <div className="relative">
        <Link2 size={16} className="absolute left-3.5 top-3.5 text-muted" />
        <input
          name="whatsapp_url"
          required
          type="url"
          placeholder="https://chat.whatsapp.com/..."
          className={inputBase}
        />
      </div>

      {/* Descripción */}
      <textarea
        name="description"
        maxLength={280}
        rows={3}
        placeholder="Describe brevemente de qué trata el grupo (opcional, máx 280)"
        className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent/40"
      />

      {/* Imagen */}
      <div>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-surface p-3 text-sm text-muted transition-colors hover:border-accent/50">
          <ImagePlus size={18} className="text-accent" />
          {preview ? "Cambiar imagen" : "Añadir imagen (opcional, máx 2MB)"}
          <input
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
        {preview && (
          <div className="relative mt-3 w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Vista previa"
              className="h-28 rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white"
              aria-label="Quitar imagen"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {state.error && (
        <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={15} /> {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
