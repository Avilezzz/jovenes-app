import { z } from "zod";
import { CATEGORIES } from "./types";
import { PROVINCES, cantonsOf } from "./ecuador-dpa";

// Esquemas de validación (se usan en cliente y servidor).

export const authSchema = z.object({
  email: z.string().trim().email("Correo inválido").max(254),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña es demasiado larga"),
});

// Solo aceptamos enlaces de invitación oficiales de WhatsApp.
const whatsappRegex = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{6,40}$/;

export const groupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(60, "Máximo 60 caracteres"),
    description: z
      .string()
      .trim()
      .max(280, "Máximo 280 caracteres")
      .optional()
      .or(z.literal("")),
    category: z.enum(CATEGORIES),
    province: z
      .string()
      .trim()
      .refine((v) => PROVINCES.includes(v), "Selecciona una provincia válida"),
    canton: z.string().trim().min(1, "Selecciona un cantón"),
    whatsapp_url: z
      .string()
      .trim()
      .regex(
        whatsappRegex,
        "Debe ser un enlace válido: https://chat.whatsapp.com/...",
      ),
    members_hint: z.coerce
      .number()
      .int()
      .min(0)
      .max(100000)
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => cantonsOf(data.province).includes(data.canton), {
    message: "El cantón no corresponde a la provincia",
    path: ["canton"],
  });

export type AuthInput = z.infer<typeof authSchema>;
export type GroupInput = z.infer<typeof groupSchema>;
