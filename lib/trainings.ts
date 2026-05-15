import { createCopySlug, normalizeSlug } from "@/lib/slug";
import type { AppSupabaseClient } from "@/lib/supabase/types";
import type { TrainingCourseWithSections } from "@/types/training";

export async function listTrainingCourses(supabase: AppSupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("training_courses")
    .select("*, training_sections(id)")
    .eq("user_id", userId)
    .neq("status", "archived")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTrainingCourse(
  supabase: AppSupabaseClient,
  id: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("training_courses")
    .select("*, training_sections(*, training_assets(*))")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data as TrainingCourseWithSections;
}

export async function getPublishedTrainingCourse(supabase: AppSupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from("training_courses")
    .select("*, training_sections(*, training_assets(*))")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) throw error;
  return data as TrainingCourseWithSections;
}

function getCoursePayload(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const slug = normalizeSlug(String(formData.get("slug") || title));
  const description = String(formData.get("description") || "").trim() || null;

  if (!title || !slug) {
    throw new Error("タイトルとURL slugを入力してください。");
  }

  return { title, slug, description };
}

export async function createTrainingCourse(
  supabase: AppSupabaseClient,
  userId: string,
  formData: FormData,
) {
  const payload = getCoursePayload(formData);
  const { data, error } = await supabase
    .from("training_courses")
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

export async function updateTrainingCourse(
  supabase: AppSupabaseClient,
  id: string,
  userId: string,
  formData: FormData,
) {
  const payload = getCoursePayload(formData);
  const { error } = await supabase
    .from("training_courses")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function setTrainingPublishStatus(
  supabase: AppSupabaseClient,
  id: string,
  userId: string,
  publish: boolean,
) {
  const { error } = await supabase
    .from("training_courses")
    .update({
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function duplicateTrainingCourse(
  supabase: AppSupabaseClient,
  id: string,
  userId: string,
) {
  const source = await getTrainingCourse(supabase, id, userId);
  const { data: copy, error: courseError } = await supabase
    .from("training_courses")
    .insert({
      user_id: userId,
      title: `${source.title} のコピー`,
      slug: createCopySlug(source.slug),
      description: source.description,
      status: "draft",
      published_at: null,
    })
    .select()
    .single();

  if (courseError) throw courseError;

  for (const section of source.training_sections || []) {
    const { data: newSection, error: sectionError } = await supabase
      .from("training_sections")
      .insert({
        course_id: copy.id,
        title: section.title,
        body: section.body,
        sort_order: section.sort_order,
      })
      .select()
      .single();

    if (sectionError) throw sectionError;

    for (const asset of section.training_assets || []) {
      const extension = asset.storage_path.split(".").pop() || "bin";
      const newAssetId = crypto.randomUUID();
      const newPath = `${userId}/${copy.id}/${newSection.id}/${newAssetId}.${extension}`;
      const { error: copyError } = await supabase.storage.from("training-assets").copy(asset.storage_path, newPath);
      if (copyError) throw copyError;

      const { error: assetError } = await supabase.from("training_assets").insert({
        section_id: newSection.id,
        storage_path: newPath,
        public_url: supabase.storage.from("training-assets").getPublicUrl(newPath).data.publicUrl,
        file_name: asset.file_name,
        asset_type: asset.asset_type,
        sort_order: asset.sort_order,
      });
      if (assetError) throw assetError;
    }
  }

  return copy;
}
