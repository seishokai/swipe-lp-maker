import type { AppSupabaseClient } from "@/lib/supabase/types";

async function assertOwnCourse(supabase: AppSupabaseClient, courseId: string, userId: string) {
  const { data, error } = await supabase
    .from("training_courses")
    .select("id")
    .eq("id", courseId)
    .eq("user_id", userId)
    .single();

  if (error || !data) throw error || new Error("研修が見つかりません。");
}

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

export async function createTrainingSection(
  supabase: AppSupabaseClient,
  courseId: string,
  userId: string,
  formData: FormData,
) {
  await assertOwnCourse(supabase, courseId, userId);
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim() || null;

  if (!title) throw new Error("セクション見出しを入力してください。");

  const { data: current, error: currentError } = await supabase
    .from("training_sections")
    .select("sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (currentError) throw currentError;
  const sortOrder = typeof current?.[0]?.sort_order === "number" ? current[0].sort_order + 1 : 0;

  const { error } = await supabase.from("training_sections").insert({
    course_id: courseId,
    title,
    body,
    sort_order: sortOrder,
  });

  if (error) throw error;
}

export async function updateTrainingSection(
  supabase: AppSupabaseClient,
  sectionId: string,
  userId: string,
  formData: FormData,
) {
  await assertOwnSection(supabase, sectionId, userId);
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim() || null;

  if (!title) throw new Error("セクション見出しを入力してください。");

  const { error } = await supabase
    .from("training_sections")
    .update({ title, body, updated_at: new Date().toISOString() })
    .eq("id", sectionId);

  if (error) throw error;
}

export async function deleteTrainingSection(
  supabase: AppSupabaseClient,
  sectionId: string,
  userId: string,
) {
  await assertOwnSection(supabase, sectionId, userId);
  const { error } = await supabase.from("training_sections").delete().eq("id", sectionId);
  if (error) throw error;
}

export async function reorderTrainingSections(
  supabase: AppSupabaseClient,
  courseId: string,
  userId: string,
  sectionIds: string[],
) {
  await assertOwnCourse(supabase, courseId, userId);
  const uniqueIds = [...new Set(sectionIds)];
  if (uniqueIds.length !== sectionIds.length) throw new Error("セクションIDが重複しています。");

  const { data: current, error } = await supabase
    .from("training_sections")
    .select("id")
    .eq("course_id", courseId);

  if (error) throw error;
  const currentIds = (current || []).map((section) => section.id).sort();
  const nextIds = [...sectionIds].sort();

  if (currentIds.length !== nextIds.length || currentIds.some((id, index) => id !== nextIds[index])) {
    throw new Error("現在のセクション一覧と保存しようとしている順番が一致しません。画面を更新してもう一度試してください。");
  }

  for (const [sortOrder, sectionId] of sectionIds.entries()) {
    const { error: updateError } = await supabase
      .from("training_sections")
      .update({ sort_order: sortOrder, updated_at: new Date().toISOString() })
      .eq("id", sectionId)
      .eq("course_id", courseId);
    if (updateError) throw updateError;
  }
}
