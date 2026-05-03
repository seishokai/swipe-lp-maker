import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { revalidatePath } from "next/cache";
import { CtaAreaEditor } from "@/components/dashboard/cta-area-editor";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { LpForm } from "@/components/dashboard/lp-form";
import { PublishToggle } from "@/components/dashboard/publish-toggle";
import { PublicUrlPanel } from "@/components/dashboard/public-url-panel";
import { SortableImageList } from "@/components/dashboard/sortable-image-list";
import { getSiteUrl } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { deleteCtaArea, upsertCtaArea } from "@/lib/cta-areas";
import { createImageRecord, deleteImageRecord, reorderImages } from "@/lib/lp-images";
import { getLandingPage, setPublishStatus, updateLandingPage } from "@/lib/lps";

export default async function EditLpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const lp = await getLandingPage(supabase, id, user.id);
  const images = [...lp.lp_images].sort((a, b) => a.sort_order - b.sort_order);
  const publicUrl = `${getSiteUrl()}/lp/${lp.slug}`;

  async function saveAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    await updateLandingPage(supabase, id, user.id, formData);
    revalidatePath(`/dashboard/lps/${id}/edit`);
    revalidatePath(`/lp/${lp.slug}`);
  }

  async function uploadAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const files = formData
      .getAll("images")
      .filter((file): file is File => file instanceof File && file.size > 0);

    for (const file of files) {
      await createImageRecord(supabase, id, user.id, file);
    }

    revalidatePath(`/dashboard/lps/${id}/edit`);
    revalidatePath(`/lp/${lp.slug}`);
  }

  async function moveAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const current = await getLandingPage(supabase, id, user.id);
    const ordered = [...current.lp_images].sort((a, b) => a.sort_order - b.sort_order);
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
    const { supabase } = await requireUser();
    const imageIds = String(formData.get("image_ids") || "")
      .split(",")
      .map((imageId) => imageId.trim())
      .filter(Boolean);
    await reorderImages(supabase, imageIds);
    revalidatePath(`/dashboard/lps/${id}/edit`);
    revalidatePath(`/lp/${lp.slug}`);
  }

  async function ctaAction(formData: FormData) {
    "use server";
    const { supabase } = await requireUser();
    await upsertCtaArea(supabase, formData);
    revalidatePath(`/dashboard/lps/${id}/edit`);
    revalidatePath(`/lp/${lp.slug}`);
  }

  async function deleteCtaAction(formData: FormData) {
    "use server";
    const { supabase } = await requireUser();
    await deleteCtaArea(supabase, String(formData.get("cta_area_id")));
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
    <div className="grid gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/lps" className="text-sm text-slate-500">
            LP一覧へ
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-ink">{lp.title}</h1>
          <a className="mt-2 inline-flex items-center gap-1 text-sm text-accent" href={publicUrl} target="_blank">
            /lp/{lp.slug}
            <ExternalLink size={14} />
          </a>
        </div>
        <PublishToggle lp={lp} action={publishAction} />
      </div>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold text-ink">基本設定</h2>
        <LpForm lp={lp} action={saveAction} />
      </section>

      <PublicUrlPanel url={publicUrl} published={lp.status === "published"} />

      <section className="grid gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">スライド管理</h2>
          <p className="mt-1 text-sm text-slate-500">画像・動画の追加、順番変更、削除をここでまとめて行います。</p>
        </div>
        <ImageUploader action={uploadAction} />
        <SortableImageList images={images} moveAction={moveAction} reorderAction={reorderAction} deleteAction={deleteImageAction} />
      </section>

      <section className="grid gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">画像内CTAエリア</h2>
          <p className="mt-1 text-sm text-slate-500">クリックさせたい場所を画像の上でドラッグして、透明リンクを作ります。</p>
        </div>
        {images.length > 0 ? (
          <CtaAreaEditor lp={{ ...lp, lp_images: images }} action={ctaAction} deleteAction={deleteCtaAction} />
        ) : (
          <p className="rounded-lg border border-line bg-white p-5 text-sm text-slate-500 shadow-soft">
            先にスライドを追加すると、CTAエリアを設定できます。
          </p>
        )}
      </section>
    </div>
  );
}
