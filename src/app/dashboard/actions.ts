"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { groupSchema } from "@/lib/validation";

export type GroupState = {
  error?: string;
  success?: boolean;
};

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function createGroup(
  _prev: GroupState,
  formData: FormData,
): Promise<GroupState> {
  if (!hasSupabaseConfig) {
    return { error: "Supabase no está configurado." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  // Validación de los campos de texto
  const parsed = groupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    province: formData.get("province"),
    canton: formData.get("canton"),
    whatsapp_url: formData.get("whatsapp_url"),
    members_hint: formData.get("members_hint"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Subida de imagen (opcional)
  let image_url: string | null = null;
  const image = formData.get("image") as File | null;

  if (image && image.size > 0) {
    if (image.size > MAX_IMAGE_BYTES) {
      return { error: "La imagen supera el límite de 2MB." };
    }
    if (!ALLOWED_TYPES.includes(image.type)) {
      return { error: "Formato no permitido (usa PNG, JPG, WEBP o GIF)." };
    }
    const ext = image.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("group-images")
      .upload(path, image, { contentType: image.type, upsert: false });

    if (uploadError) {
      return { error: "No se pudo subir la imagen. Intenta de nuevo." };
    }
    const { data: pub } = supabase.storage
      .from("group-images")
      .getPublicUrl(path);
    image_url = pub.publicUrl;
  }

  const { error } = await supabase.from("groups").insert({
    owner_id: user.id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    category: parsed.data.category,
    province: parsed.data.province,
    canton: parsed.data.canton,
    whatsapp_url: parsed.data.whatsapp_url,
    members_hint:
      parsed.data.members_hint === "" || parsed.data.members_hint === undefined
        ? null
        : Number(parsed.data.members_hint),
    image_url,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ese enlace de WhatsApp ya fue publicado." };
    }
    if (error.message.includes("límite")) {
      return { error: "Has alcanzado el límite de 15 grupos." };
    }
    return { error: "No se pudo crear el grupo. Intenta de nuevo." };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteGroup(id: string): Promise<GroupState> {
  if (!hasSupabaseConfig) return { error: "Supabase no está configurado." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  // RLS garantiza que solo el dueño puede borrar.
  const { error } = await supabase.from("groups").delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar el grupo." };

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true };
}
