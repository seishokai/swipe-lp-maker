import Link from "next/link";
import { Copy, ExternalLink, Pencil, Plus } from "lucide-react";
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
          <h1 className="text-2xl font-semibold text-ink">LP一覧</h1>
          <p className="mt-1 text-sm text-slate-600">画像スワイプ型LPの作成、編集、公開を管理します。</p>
        </div>
        <Link href="/dashboard/lps/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white">
          <Plus size={18} />
          新規作成
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">タイトル</th>
              <th className="px-4 py-3">状態</th>
              <th className="px-4 py-3">画像</th>
              <th className="px-4 py-3">公開URL</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {lps.map((lp) => (
              <tr key={lp.id} className="border-b border-line last:border-0">
                <td className="px-4 py-4">
                  <div className="font-medium text-ink">{lp.title}</div>
                  <div className="text-xs text-slate-500">/{lp.slug}</div>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {statusLabel[lp.status] || lp.status}
                  </span>
                </td>
                <td className="px-4 py-4">{lp.lp_images.length}</td>
                <td className="px-4 py-4">
                  <a className="inline-flex items-center gap-1 text-accent" href={`${getSiteUrl()}/lp/${lp.slug}`} target="_blank">
                    /lp/{lp.slug}
                    <ExternalLink size={14} />
                  </a>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <Link href={`/dashboard/lps/${lp.id}/edit`} className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3">
                      <Pencil size={16} />
                      編集
                    </Link>
                    <form action={duplicateAction}>
                      <input type="hidden" name="id" value={lp.id} />
                      <Button className="h-9 bg-white px-3 text-ink ring-1 ring-line hover:bg-slate-50">
                        <Copy size={16} />
                        複製
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {lps.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={5}>
                  まだLPがありません。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
