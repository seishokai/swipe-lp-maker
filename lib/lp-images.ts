import type { AppSupabaseClient } from "@/lib/supabase/types";

const MAX_UPLOAD_FILES = 20;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 120 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function assertUploadableFile(file: File) {
  const isVideo = file.type.startsWith("video/");
  const allowed = isVideo ? ALLOWED_VIDEO_TYPES.has(file.type) : ALLOWED_IMAGE_TYPES.has(file.type);
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

  if (!allowed) {
    throw new Error(
      `${file.name} は対応していないファイル形式です。JPG / PNG / WebP / GIF / MP4 / WebM / MOV を選んでください。`,
    );
  }

  if (file.size > maxBytes) {
    throw new Error(`${file.name} のサイズが大きすぎます。画像は20MB、動画は120MBまでです。`);
  }
}

async function assertOwnLandingPage(supabase: AppSupabaseClient, lpId: string, userId: string) {
  const { data: lp, error } = await supabase
    .from("landing_pages")
    .select("id")
    .eq("id", lpId)
    .eq("user_id", userId)
    .single();

  if (error || !lp) throw error || new Error("LPが見つかりません。");
}

export async function createImageRecord(
  supabase: AppSupabaseClient,
  lpId: string,
  userId: string,
  file: File,
) {
  await createImageRecords(supabase, lpId, userId, [file]);
}

export async function createImageRecords(
  supabase: AppSupabaseClient,
  lpId: string,
  userId: string,
  files: File[],
) {
  if (files.length === 0) return;
  if (files.length > MAX_UPLOAD_FILES) {
    throw new Error(`一度にアップロードできるのは${MAX_UPLOAD_FILES}ファイルまでです。`);
  }

  files.forEach(assertUploadableFile);
  await assertOwnLandingPage(supabase, lpId, userId);

  const { data: current, error: currentError } = await supabase
    .from("lp_images")
    .select("sort_order")
    .eq("lp_id", lpId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (currentError) throw currentError;

  const firstSortOrder = typeof current?.[0]?.sort_order === "number" ? current[0].sort_order + 1 : 0;
  const uploadedPaths: string[] = [];

  try {
    const rows = [];

    for (const [index, file] of files.entries()) {
      const extension = file.name.split(".").pop()?.toLowerCase() || (file.type.startsWith("video/") ? "mp4" : "jpg");
      const mediaType = file.type.startsWith("video/") ? "video" : "image";
      const imageId = crypto.randomUUID();
      const path = `${userId}/${lpId}/${imageId}.${extension}`;

      const { error: uploadError } = await supabase.storage.from("lp-images").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) throw uploadError;

      uploadedPaths.push(path);
      rows.push({
        lp_id: lpId,
        storage_path: path,
        public_url: supabase.storage.from("lp-images").getPublicUrl(path).data.publicUrl,
        alt_text: file.name,
        media_type: mediaType,
        sort_order: firstSortOrder + index,
      });
    }

    const { error } = await supabase.from("lp_images").insert(rows);
    if (error) throw error;
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from("lp-images").remove(uploadedPaths);
    }
    throw error;
  }
}

export async function reorderImages(
  supabase: AppSupabaseClient,
  lpId: string,
  userId: string,
  imageIds: string[],
) {
  await assertOwnLandingPage(supabase, lpId, userId);

  const uniqueIds = [...new Set(imageIds)];
  if (uniqueIds.length !== imageIds.length) {
    throw new Error("並び替え対象のスライドIDが重複しています。");
  }

  const { data: images, error: imagesError } = await supabase
    .from("lp_images")
    .select("id")
    .eq("lp_id", lpId);

  if (imagesError) throw imagesError;

  const currentIds = (images || []).map((image) => image.id).sort();
  const nextIds = [...imageIds].sort();

  if (currentIds.length !== nextIds.length || currentIds.some((imageId, index) => imageId !== nextIds[index])) {
    throw new Error("現在のスライド一覧と保存しようとしている順番が一致しません。画面を更新してもう一度試してください。");
  }

  for (const [sortOrder, imageId] of imageIds.entries()) {
    const { error } = await supabase
      .from("lp_images")
      .update({ sort_order: sortOrder, updated_at: new Date().toISOString() })
      .eq("id", imageId)
      .eq("lp_id", lpId);
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
    image.lp_id,
    userId,
    (remaining || []).map((item) => item.id),
  );

  const { error: storageError } = await supabase.storage.from("lp-images").remove([image.storage_path]);
  if (storageError) {
    console.error("Failed to remove LP image from storage", storageError);
  }
}
