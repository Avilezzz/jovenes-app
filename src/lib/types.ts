// Tipos compartidos de la aplicación.

export type GroupStatus = "pending" | "approved" | "rejected";

export type Notification = {
  id: string;
  user_id: string;
  group_id: string | null;
  group_name: string;
  type: "approved" | "rejected";
  read: boolean;
  created_at: string;
};

export type Group = {
  id: string;
  created_at: string;
  owner_id: string;
  name: string;
  description: string | null;
  category: string;
  whatsapp_url: string;
  image_url: string | null;
  members_hint: number | null;
  status: GroupStatus;
  province: string | null;
  canton: string | null;
};

// Categorías = instituciones/ministerios donde los beneficiarios de
// Jóvenes en Acción realizan sus pasantías y servicio comunitario.
export const CATEGORIES = [
  "Infraestructura y Transporte",
  "Salud Pública",
  "Educación, Deporte y Cultura",
  "Gestión de Riesgos",
  "General",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Metadatos por categoría: etiqueta corta (para chips/badges),
// nombre oficial completo y degradado de color del placeholder.
export const CATEGORY_META: Record<
  Category,
  { short: string; full: string; gradient: string }
> = {
  "Infraestructura y Transporte": {
    short: "Infraestructura",
    full: "Ministerio de Infraestructura y Transporte",
    gradient: "from-amber-400 to-orange-600",
  },
  "Salud Pública": {
    short: "Salud",
    full: "Ministerio de Salud Pública",
    gradient: "from-rose-400 to-red-600",
  },
  "Educación, Deporte y Cultura": {
    short: "Educación",
    full: "Ministerio de Educación, Deporte y Cultura",
    gradient: "from-sky-400 to-blue-600",
  },
  "Gestión de Riesgos": {
    short: "Gestión de Riesgos",
    full: "Secretaría Nacional de Gestión de Riesgos",
    gradient: "from-emerald-400 to-green-700",
  },
  General: {
    short: "General",
    full: "General / Otros",
    gradient: "from-slate-400 to-slate-600",
  },
};

export function categoryMeta(category: string) {
  return (
    CATEGORY_META[category as Category] ?? {
      short: category,
      full: category,
      gradient: "from-slate-400 to-slate-600",
    }
  );
}
