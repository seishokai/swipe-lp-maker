import type { AppSupabaseClient } from "@/lib/supabase/types";

export async function createImageRecord(
  supabase: AppSupabaseClient,
  lpId: string,
  userId: string,
  file: File,
) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const imageId = crypto.randomUUID();
  const path = `${userId}/${lpId}/${imageId}.${extension}`;

  const { data: lp, error: lpError } = await supabase
    .from("landing_pages")
    .select("id")
    .eq("id", lpId)
    .eq("user_id", userId)
    .single();

  if (lpError || !lp) throw lpError || new Error("LP not found.");

  const { error: uploadError } = await supabase.storage.from("lp-images").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { count } = await supabase.from("lp_images").select("id", { count: "exact", head: true }).eq("lp_id", lpId);
  const publicUrl = supabase.storage.from("lp-images").getPublicUrl(path).data.publicUrl;

  const { error } = await supabase.from("lp_images").insert({
    lp_id: lpId,
    storage_path: path,
    public_url: publicUrl,
    alt_text: file.name,
    sort_order: count || 0,
  });

  if (error) throw error;
}

export async function reorderImages(
  supabase: AppSupabaseClient,
  imageIds: string[],
) {
  for (const [sortOrder, imageId] of imageIds.entries()) {
    const { error } = await supabase
      .from("lp_images")
      .update({ sort_order: sortOrder, updated_at: new Date().toISOString() })
      .eq("id", imageId);
    if (error) throw error;
  }
}

export async function deleteImageRecord(
  supabase: AppSupabaseClient,
  imageId: string,
  userId: string,
) {
  const { data: image, error: imageError } = await supabase
    .from("lp_images")
    .select("id, lp_id, storage_path, landing_pages!inner(user_id)")
    .eq("id", imageId)
    .eq("landing_pages.user_id", userId)
    .single();

  if (imageError) throw imageError;

  const { error: storageError } = await supabase.storage.from("lp-images").remove([image.storage_path]);
  if (storageError) throw storageError;

  const { error: deleteError } = await supabase.from("lp_images").delete().eq("id", imageId);
  if (deleteError) throw deleteError;

  const { data: remaining, error: remainingError } = await supabase
    .from("lp_images")
    .select("id")
    .eq("lp_id", image.lp_id)
    .order("sort_order", { ascending: true });

  if (remainingError) throw remainingError;
  await reorderImages(
    supabase,
    (remaining || []).map((item) => item.id),
  );
}
