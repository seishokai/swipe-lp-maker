import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { revalidatePath } from "next/cache";
import { TrainingForm } from "@/components/dashboard/training-form";
import { TrainingPublishToggle } from "@/components/dashboard/training-publish-toggle";
import { TrainingSectionEditor } from "@/components/dashboard/training-section-editor";
import { PublicUrlPanel } from "@/components/dashboard/public-url-panel";
import { getSiteUrl } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { deleteTrainingAsset } from "@/lib/training-assets";
import { createTrainingSection, deleteTrainingSection, reorderTrainingSections, updateTrainingSection } from "@/lib/training-sections";
import { getTrainingCourse, setTrainingPublishStatus, updateTrainingCourse } from "@/lib/trainings";

export default async function EditTrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const training = await getTrainingCourse(supabase, id, user.id);
  const publicUrl = `${getSiteUrl()}/training/${training.slug}`;

  async function saveAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const current = await getTrainingCourse(supabase, id, user.id);
    await updateTrainingCourse(supabase, id, user.id, formData);
    const updated = await getTrainingCourse(supabase, id, user.id);
    revalidatePath(`/dashboard/trainings/${id}/edit`);
    revalidatePath("/dashboard/trainings");
    revalidatePath(`/training/${current.slug}`);
    revalidatePath(`/training/${updated.slug}`);
  }

  async function publishAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const current = await getTrainingCourse(supabase, id, user.id);
    await setTrainingPublishStatus(supabase, id, user.id, String(formData.get("publish")) === "true");
    revalidatePath(`/dashboard/trainings/${id}/edit`);
    revalidatePath("/dashboard/trainings");
    revalidatePath(`/training/${current.slug}`);
  }

  async function createSectionAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const current = await getTrainingCourse(supabase, id, user.id);
    await createTrainingSection(supabase, id, user.id, formData);
    revalidatePath(`/dashboard/trainings/${id}/edit`);
    revalidatePath(`/training/${current.slug}`);
  }

  async function updateSectionAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const current = await getTrainingCourse(supabase, id, user.id);
    await updateTrainingSection(supabase, String(formData.get("section_id")), user.id, formData);
    revalidatePath(`/dashboard/trainings/${id}/edit`);
    revalidatePath(`/training/${current.slug}`);
  }

  async function deleteSectionAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const current = await getTrainingCourse(supabase, id, user.id);
    await deleteTrainingSection(supabase, String(formData.get("section_id")), user.id);
    revalidatePath(`/dashboard/trainings/${id}/edit`);
    revalidatePath(`/training/${current.slug}`);
  }

  async function reorderSectionAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const current = await getTrainingCourse(supabase, id, user.id);
    const sectionIds = String(formData.get("section_ids") || "")
      .split(",")
      .map((sectionId) => sectionId.trim())
      .filter(Boolean);
    await reorderTrainingSections(supabase, id, user.id, sectionIds);
    revalidatePath(`/dashboard/trainings/${id}/edit`);
    revalidatePath(`/training/${current.slug}`);
  }

  async function deleteAssetAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const current = await getTrainingCourse(supabase, id, user.id);
    await deleteTrainingAsset(supabase, String(formData.get("asset_id")), user.id);
    revalidatePath(`/dashboard/trainings/${id}/edit`);
    revalidatePath(`/training/${current.slug}`);
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/dashboard/trainings" className="text-sm text-slate-500 hover:text-ink">
              研修資料一覧へ
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-ink">{training.title}</h1>
            <a className="mt-2 inline-flex items-center gap-1 text-sm text-accent" href={publicUrl} target="_blank" rel="noreferrer">
              /training/{training.slug}
              <ExternalLink size={14} />
            </a>
          </div>
          <TrainingPublishToggle training={training} action={publishAction} />
        </div>
      </div>

      <PublicUrlPanel url={publicUrl} published={training.status === "published"} />

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold text-ink">基本設定</h2>
        <TrainingForm training={training} action={saveAction} />
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold text-ink">研修内容</h2>
        <TrainingSectionEditor
          course={training}
          userId={user.id}
          createSectionAction={createSectionAction}
          updateSectionAction={updateSectionAction}
          deleteSectionAction={deleteSectionAction}
          reorderSectionAction={reorderSectionAction}
          deleteAssetAction={deleteAssetAction}
        />
      </section>
    </div>
  );
}
