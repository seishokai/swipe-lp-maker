import Link from "next/link";
import { Copy, ExternalLink, Images, Pencil, Plus } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { duplicateLandingPage, listLandingPages } from "@/lib/lps";
import type { LandingPage } from "@/types/lp";

type LpListItem = LandingPage & {
  lp_images: Array<{ id: string }>;
};

const statusLabel: Record<string, string> = {
  draft: "非公開",
  published: "公開中",
  archived: "アーカイブ",
};

const statusClass: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  archived: "bg-slate-100 text-slate-500",
};

export default async function LpListPage() {
  const { supabase, user } = await requireUser();
  const lps = (await listLandingPages(supabase, user.id)) as LpListItem[];

  async function duplicateAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const copy = await duplicateLandingPage(supabase, String(formData.get("id")), user.id);
    revalidatePath("/dashboard/lps");
    redirect(`/dashboard/lps/${copy.id}/edit`);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-ink">LP一覧</h1>
          <p className="mt-2 text-sm text-slate-600">作成済みLPの編集、公開ページ確認、複製をここから行います。</p>
        </div>
        <Link href="/dashboard/lps/new" className="inline-flex h-12 items-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black">
          <Plus size={18} />
          新規作成
        </Link>
      </div>

      {lps.length === 0 ? (
        <div className="rounded-lg border border-line bg-white p-10 text-center shadow-soft">
          <p className="text-base font-semibold text-ink">まだLPがありません</p>
          <p className="mt-2 text-sm text-slate-500">最初のLPを作成して、画像や動画を追加しましょう。</p>
          <Link href="/dashboard/lps/new" className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white">
            <Plus size={18} />
            LPを作る
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {lps.map((lp) => {
            const publicUrl = `${getSiteUrl()}/lp/${lp.slug}`;
            return (
              <article key={lp.id} className="grid gap-4 rounded-lg border border-line bg-white p-4 shadow-soft lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-ink">{lp.title}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[lp.status] || "bg-slate-100 text-slate-700"}`}>
                      {statusLabel[lp.status] || lp.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span>/{lp.slug}</span>
                    <span className="inline-flex items-center gap-1">
                      <Images size={15} />
                      {lp.lp_images.length}枚
                    </span>
                    {lp.status === "published" ? (
                      <a className="inline-flex items-center gap-1 text-accent" href={publicUrl} target="_blank" rel="noreferrer">
                        公開URLを見る
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        未公開
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Link href={`/dashboard/lps/${lp.id}/edit`} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black">
                    <Pencil size={16} />
                    <span>編集</span>
                  </Link>
                  {lp.status === "published" ? (
                    <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-mist">
                      <ExternalLink size={16} />
                      <span>公開ページ</span>
                    </a>
                  ) : (
                    <span className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-slate-100 px-4 text-sm font-semibold text-slate-500">
                      <ExternalLink size={16} />
                      <span>非公開</span>
                    </span>
                  )}
                  <form action={duplicateAction} className="contents">
                    <input type="hidden" name="id" value={lp.id} />
                    <Button className="h-11 bg-white px-4 text-ink ring-1 ring-line hover:bg-mist">
                      <Copy size={16} />
                      <span>複製</span>
                    </Button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
