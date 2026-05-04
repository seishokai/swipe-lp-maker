import type { AppSupabaseClient } from "@/lib/supabase/types";

function numberFromForm(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  if (!Number.isFinite(value)) {
    throw new Error(`${key} は数値で入力してください。`);
  }
  return value;
}

function assertAreaBounds(x: number, y: number, width: number, height: number) {
  if (
    x < 0 ||
    y < 0 ||
    width <= 0 ||
    height <= 0 ||
    x > 1 ||
    y > 1 ||
    width > 1 ||
    height > 1 ||
    x + width > 1 ||
    y + height > 1
  ) {
    throw new Error("CTAエリアは画像の範囲内に収まるように設定してください。");
  }
}

async function getOwnedImageContext(supabase: AppSupabaseClient, imageId: string, userId: string) {
  const { data, error } = await supabase
    .from("lp_images")
    .select("id, landing_pages!inner(user_id, cta_url)")
    .eq("id", imageId)
    .eq("landing_pages.user_id", userId)
    .single();

  if (error || !data) throw error || new Error("スライドが見つかりません。");

  const image = data as unknown as {
    id: string;
    landing_pages: { user_id: string; cta_url: string | null } | Array<{ user_id: string; cta_url: string | null }>;
  };
  const landingPage = Array.isArray(image.landing_pages) ? image.landing_pages[0] : image.landing_pages;

  if (!landingPage) throw new Error("LPが見つかりません。");
  return { id: image.id, landingPage };
}

export async function upsertCtaArea(
  supabase: AppSupabaseClient,
  userId: string,
  formData: FormData,
) {
  const id = String(formData.get("id") || "");
  const lpImageId = String(formData.get("lp_image_id") || "");
  const image = await getOwnedImageContext(supabase, lpImageId, userId);
  const x = numberFromForm(formData, "x");
  const y = numberFromForm(formData, "y");
  const width = numberFromForm(formData, "width");
  const height = numberFromForm(formData, "height");
  const url = String(formData.get("url") || "").trim() || null;

  assertAreaBounds(x, y, width, height);

  if (!url && !image.landingPage.cta_url) {
    throw new Error("CTAエリアには個別URL、または基本設定の共通CTA URLが必要です。");
  }

  const payload = {
    lp_image_id: lpImageId,
    label: String(formData.get("label") || "").trim() || null,
    url,
    x,
    y,
    width,
    height,
    updated_at: new Date().toISOString(),
  };

  const query = id
    ? supabase.from("cta_areas").update(payload).eq("id", id).eq("lp_image_id", lpImageId)
    : supabase.from("cta_areas").insert(payload);

  const { error } = await query;
  if (error) throw error;
}

export async function deleteCtaArea(
  supabase: AppSupabaseClient,
  userId: string,
  id: string,
) {
  const { data, error: findError } = await supabase
    .from("cta_areas")
    .select("id, lp_images!inner(id, landing_pages!inner(user_id))")
    .eq("id", id)
    .eq("lp_images.landing_pages.user_id", userId)
    .single();

  if (findError || !data) throw findError || new Error("CTAエリアが見つかりません。");

  const { error } = await supabase.from("cta_areas").delete().eq("id", id);
  if (error) throw error;
}
