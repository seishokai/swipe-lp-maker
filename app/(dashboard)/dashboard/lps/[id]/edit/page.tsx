import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { revalidatePath } from "next/cache";
import { CtaAreaEditor } from "@/components/dashboard/cta-area-editor";
import { EditLpTabs } from "@/components/dashboard/edit-lp-tabs";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { BasicSettingsForm, TrackingSettingsForm } from "@/components/dashboard/lp-settings-forms";
import { PublishToggle } from "@/components/dashboard/publish-toggle";
import { PublicUrlPanel } from "@/components/dashboard/public-url-panel";
import { SortableImageList } from "@/components/dashboard/sortable-image-list";
import { getSiteUrl } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { deleteCtaArea, upsertCtaArea } from "@/lib/cta-areas";
import { createImageRecords, deleteImageRecord, reorderImages } from "@/lib/lp-images";
import { getLandingPage, setPublishStatus, updateLandingPage } from "@/lib/lps";

export default async function EditLpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const lp = await getLandingPage(supabase, id, user.id);
  const images = [...(lp.lp_images || [])].sort((a, b) => a.sort_order - b.sort_order);
  const publicUrl = `${getSiteUrl()}/lp/${lp.slug}`;

  async function saveAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const previousSlug = lp.slug;
    await updateLandingPage(supabase, id, user.id, formData);
    const updated = await getLandingPage(supabase, id, user.id);
    revalidatePath(`/dashboard/lps/${id}/edit`);
    revalidatePath(`/lp/${previousSlug}`);
    revalidatePath(`/lp/${updated.slug}`);
  }

  async function uploadAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const files = formData
      .getAll("images")
      .filter((file): file is File => file instanceof File && file.size > 0);

    await createImageRecords(supabase, id, user.id, files);

    revalidatePath(`/dashboard/lps/${id}/edit`);
    revalidatePath(`/lp/${lp.slug}`);
  }

  async function moveAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const current = await getLandingPage(supabase, id, user.id);
    const ordered = [...(current.lp_images || [])].sort((a, b) => a.sort_order - b.sort_order);
    const imageId = String(formData.get("image_id"));
    const direction = String(formData.get("direction"));
    const index = ordered.findIndex((image) => image.id === imageId);
    const target = direction === "up" ? index - 1 : index + 1;

    if (index >= 0 && target >= 0 && target < ordered.length) {
      const next = [...ordered];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      await reorderImages(
        supabase,
        id,
        user.id,
        next.map((image) => image.id),
      );
      revalidatePath(`/dashboard/lps/${id}/edit`);
      revalidatePath(`/lp/${lp.slug}`);
    }
  }

  async function deleteImageAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    await deleteImageRecord(supabase, String(formData.get("image_id")), user.id);
    revalidatePath(`/dashboard/lps/${id}/edit`);
    revalidatePath(`/lp/${lp.slug}`);
  }

  async function reorderAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const imageIds = String(formData.get("image_ids") || "")
      .split(",")
      .map((imageId) => imageId.trim())
      .filter(Boolean);
    await reorderImages(supabase, id, user.id, imageIds);
    revalidatePath(`/dashboard/lps/${id}/edit`);
    revalidatePath(`/lp/${lp.slug}`);
  }

  async function ctaAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    await upsertCtaArea(supabase, user.id, formData);
    revalidatePath(`/dashboard/lps/${id}/edit`);
    revalidatePath(`/lp/${lp.slug}`);
  }

  async function deleteCtaAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    await deleteCtaArea(supabase, user.id, String(formData.get("cta_area_id")));
    revalidatePath(`/dashboard/lps/${id}/edit`);
    revalidatePath(`/lp/${lp.slug}`);
  }

  async function publishAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    await setPublishStatus(supabase, id, user.id, String(formData.get("publish")) === "true");
    revalidatePath(`/dashboard/lps/${id}/edit`);
    revalidatePath(`/lp/${lp.slug}`);
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/dashboard/lps" className="text-sm text-slate-500 hover:text-ink">
              LP一覧へ
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-ink">{lp.title}</h1>
            <a className="mt-2 inline-flex items-center gap-1 text-sm text-accent" href={publicUrl} target="_blank" rel="noreferrer">
              /lp/{lp.slug}
              <ExternalLink size={14} />
            </a>
          </div>
          <PublishToggle lp={lp} action={publishAction} />
        </div>
      </div>

      <PublicUrlPanel url={publicUrl} published={lp.status === "published"} />

      <EditLpTabs
        slides={
          <section className="grid gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">画像・動画を編集</h2>
              <p className="mt-1 text-sm text-slate-500">まずここで素材を追加し、公開LPの表示順を整えます。</p>
            </div>
            <ImageUploader action={uploadAction} />
            <SortableImageList images={images} moveAction={moveAction} reorderAction={reorderAction} deleteAction={deleteImageAction} />
          </section>
        }
        cta={
          <section className="grid gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">画像内CTAエリア</h2>
              <p className="mt-1 text-sm text-slate-500">クリックさせたい場所を画像上でドラッグして、透明リンクを作ります。</p>
            </div>
            <CtaAreaEditor lp={{ ...lp, lp_images: images }} action={ctaAction} deleteAction={deleteCtaAction} />
          </section>
        }
        basic={<BasicSettingsForm lp={lp} action={saveAction} />}
        tracking={<TrackingSettingsForm lp={lp} action={saveAction} />}
      />
    </div>
  );
}
