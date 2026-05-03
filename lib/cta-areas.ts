import type { AppSupabaseClient } from "@/lib/supabase/types";

export async function upsertCtaArea(
  supabase: AppSupabaseClient,
  formData: FormData,
) {
  const id = String(formData.get("id") || "");
  const payload = {
    lp_image_id: String(formData.get("lp_image_id") || ""),
    label: String(formData.get("label") || "").trim() || null,
    url: String(formData.get("url") || "").trim() || null,
    x: Number(formData.get("x")),
    y: Number(formData.get("y")),
    width: Number(formData.get("width")),
    height: Number(formData.get("height")),
    updated_at: new Date().toISOString(),
  };

  const query = id
    ? supabase.from("cta_areas").update(payload).eq("id", id)
    : supabase.from("cta_areas").insert(payload);

  const { error } = await query;
  if (error) throw error;
}

export async function deleteCtaArea(
  supabase: AppSupabaseClient,
  id: string,
) {
  const { error } = await supabase.from("cta_areas").delete().eq("id", id);
  if (error) throw error;
}
