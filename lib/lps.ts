import { createCopySlug, normalizeSlug } from "@/lib/slug";
import type { AppSupabaseClient } from "@/lib/supabase/types";
import type { LandingPageWithImages } from "@/types/lp";

export async function listLandingPages(supabase: AppSupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*, lp_images(id)")
    .eq("user_id", userId)
    .neq("status", "archived")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getLandingPage(
  supabase: AppSupabaseClient,
  id: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*, lp_images(*, cta_areas(*))")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data as LandingPageWithImages;
}

function getLpPayload(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const slug = normalizeSlug(String(formData.get("slug") || title));
  const ctaUrl = String(formData.get("cta_url") || "").trim() || null;
  const fixedCtaEnabled = formData.get("fixed_cta_enabled") === "on";
  const fixedCtaStyle = String(formData.get("fixed_cta_style") || "solid");

  if (!title || !slug) {
    throw new Error("Title and slug are required.");
  }

  if (fixedCtaEnabled && !ctaUrl) {
    throw new Error("固定CTAボタンを表示するには、共通CTA URLを入力してください。");
  }

  if (!["solid", "glass", "minimal"].includes(fixedCtaStyle)) {
    throw new Error("固定CTAデザインの値が正しくありません。");
  }

  return {
    title,
    slug,
    cta_url: ctaUrl,
    fixed_cta_enabled: fixedCtaEnabled,
    fixed_cta_label: String(formData.get("fixed_cta_label") || "").trim() || "詳しく見る",
    fixed_cta_style: fixedCtaStyle,
    meta_pixel_id: String(formData.get("meta_pixel_id") || "").trim() || null,
    google_analytics_id: String(formData.get("google_analytics_id") || "").trim() || null,
  };
}

export async function createLandingPage(
  supabase: AppSupabaseClient,
  userId: string,
  formData: FormData,
) {
  const payload = getLpPayload(formData);
  const { data, error } = await supabase
    .from("landing_pages")
    .insert({
      user_id: userId,
      ...payload,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLandingPage(
  supabase: AppSupabaseClient,
  id: string,
  userId: string,
  formData: FormData,
) {
  const payload = getLpPayload(formData);
  const { error } = await supabase
    .from("landing_pages")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function setPublishStatus(
  supabase: AppSupabaseClient,
  id: string,
  userId: string,
  publish: boolean,
) {
  const { error } = await supabase
    .from("landing_pages")
    .update({
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function duplicateLandingPage(
  supabase: AppSupabaseClient,
  id: string,
  userId: string,
) {
  const source = await getLandingPage(supabase, id, userId);

  const { data: copy, error: lpError } = await supabase
    .from("landing_pages")
    .insert({
      user_id: userId,
      title: `${source.title} のコピー`,
      slug: createCopySlug(source.slug),
      status: "draft",
      cta_url: source.cta_url,
      fixed_cta_enabled: source.fixed_cta_enabled,
      fixed_cta_label: source.fixed_cta_label,
      fixed_cta_style: source.fixed_cta_style,
      meta_pixel_id: source.meta_pixel_id,
      google_analytics_id: source.google_analytics_id,
      custom_head_tags: source.custom_head_tags,
      published_at: null,
    })
    .select()
    .single();

  if (lpError) throw lpError;

  for (const image of source.lp_images || []) {
    const extension = image.storage_path.split(".").pop() || "jpg";
    const newImageId = crypto.randomUUID();
    const newPath = `${userId}/${copy.id}/${newImageId}.${extension}`;
    const { error: copyError } = await supabase.storage.from("lp-images").copy(image.storage_path, newPath);
    if (copyError) throw copyError;

    const { data: newImage, error: imageError } = await supabase
      .from("lp_images")
      .insert({
        lp_id: copy.id,
        storage_path: newPath,
        public_url: supabase.storage.from("lp-images").getPublicUrl(newPath).data.publicUrl,
        alt_text: image.alt_text,
        width: image.width,
        height: image.height,
        media_type: image.media_type || "image",
        sort_order: image.sort_order,
      })
      .select()
      .single();

    if (imageError) throw imageError;

    if ((image.cta_areas || []).length > 0) {
      const { error: ctaError } = await supabase.from("cta_areas").insert(
        image.cta_areas.map((area) => ({
          lp_image_id: newImage.id,
          label: area.label,
          url: area.url,
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height,
        })),
      );
      if (ctaError) throw ctaError;
    }
  }

  return copy;
}
