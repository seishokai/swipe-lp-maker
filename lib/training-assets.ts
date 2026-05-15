import type { AppSupabaseClient } from "@/lib/supabase/types";
import type { TrainingAssetType } from "@/types/training";

async function assertOwnSection(supabase: AppSupabaseClient, sectionId: string, userId: string) {
  const { data, error } = await supabase
    .from("training_sections")
    .select("id, course_id, training_courses!inner(user_id)")
    .eq("id", sectionId)
    .eq("training_courses.user_id", userId)
    .single();

  if (error || !data) throw error || new Error("セクションが見つかりません。");
  return data as { id: string; course_id: string };
}

export async function createTrainingAssetRows(
  supabase: AppSupabaseClient,
  sectionId: string,
  userId: string,
  files: Array<{
    storage_path: string;
    public_url: string;
    file_name: string | null;
    asset_type: TrainingAssetType;
  }>,
) {
  if (files.length === 0) return;
  const section = await assertOwnSection(supabase, sectionId, userId);

  for (const file of files) {
    if (!file.storage_path.startsWith(`${userId}/${section.course_id}/${sectionId}/`)) {
      throw new Error("アップロード先が正しくありません。画面を更新してもう一度試してください。");
    }
    if (!["image", "video", "pdf", "file"].includes(file.asset_type)) {
      throw new Error("ファイル種別が正しくありません。");
    }
  }

  const { data: current, error: currentError } = await supabase
    .from("training_assets")
    .select("sort_order")
    .eq("section_id", sectionId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (currentError) throw currentError;
  const firstSortOrder = typeof current?.[0]?.sort_order === "number" ? current[0].sort_order + 1 : 0;

  const { error } = await supabase.from("training_assets").insert(
    files.map((file, index) => ({
      section_id: sectionId,
      storage_path: file.storage_path,
      public_url: file.public_url,
      file_name: file.file_name,
      asset_type: file.asset_type,
      sort_order: firstSortOrder + index,
    })),
  );

  if (error) throw error;
}

export async function deleteTrainingAsset(
  supabase: AppSupabaseClient,
  assetId: string,
  userId: string,
) {
  const { data: asset, error } = await supabase
    .from("training_assets")
    .select("id, storage_path, training_sections!inner(id, training_courses!inner(user_id))")
    .eq("id", assetId)
    .eq("training_sections.training_courses.user_id", userId)
    .single();

  if (error || !asset) throw error || new Error("資料ファイルが見つかりません。");

  const typed = asset as { id: string; storage_path: string };
  const { error: deleteError } = await supabase.from("training_assets").delete().eq("id", typed.id);
  if (deleteError) throw deleteError;

  const { error: storageError } = await supabase.storage.from("training-assets").remove([typed.storage_path]);
  if (storageError) console.error("Failed to remove training asset", storageError);
}
