import Link from "next/link";
import { AlertTriangle, Copy, ExternalLink, Pencil, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { duplicateTrainingCourse, listTrainingCourses } from "@/lib/trainings";

function SetupRequired({ message }: { message: string }) {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-ink">研修資料一覧</h1>
        <p className="mt-2 text-sm text-slate-600">研修資料の作成、編集、公開を管理します。</p>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-soft">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 shrink-0" size={22} />
          <div>
            <h2 className="text-lg font-semibold">Supabaseの研修用DB設定が必要です</h2>
            <p className="mt-2 text-sm leading-6">
              研修資料管理で使うテーブルがまだSupabase側にありません。SupabaseのSQL Editorで
              <span className="mx-1 font-semibold">supabase/migrations/0003_training_courses.sql</span>
              を実行してください。
            </p>
            <p className="mt-2 text-xs opacity-80">詳細: {message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function TrainingsPage() {
  const { supabase, user } = await requireUser();
  let trainings;

  try {
    trainings = await listTrainingCourses(supabase, user.id);
  } catch (error) {
    return <SetupRequired message={error instanceof Error ? error.message : "テーブル取得に失敗しました。"} />;
  }

  const siteUrl = getSiteUrl();

  async function duplicateAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const copy = await duplicateTrainingCourse(supabase, String(formData.get("training_id")), user.id);
    revalidatePath("/dashboard/trainings");
    redirect(`/dashboard/trainings/${copy.id}/edit`);
  }

  return (
    <div className="grid gap-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink">研修資料一覧</h1>
          <p className="mt-2 text-sm text-slate-600">研修資料の作成、編集、公開を管理します。</p>
        </div>
        <Link href="/dashboard/trainings/new">
          <Button className="h-12">
            <Plus size={18} />
            新規作成
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
        <div className="grid grid-cols-[1.4fr_0.6fr_0.6fr_1fr_1fr] gap-4 border-b border-line bg-paper px-5 py-4 text-sm font-semibold text-slate-700">
          <span>タイトル</span>
          <span>状態</span>
          <span>章</span>
          <span>公開URL</span>
          <span>操作</span>
        </div>
        {trainings.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">まだ研修資料がありません。</div>
        ) : (
          trainings.map((training) => (
            <div key={training.id} className="grid grid-cols-[1.4fr_0.6fr_0.6fr_1fr_1fr] items-center gap-4 border-b border-line px-5 py-4 last:border-b-0">
              <div>
                <p className="font-semibold text-ink">{training.title}</p>
                <p className="mt-1 text-sm text-slate-500">/{training.slug}</p>
              </div>
              <span className="w-fit rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink">
                {training.status === "published" ? "公開中" : "下書き"}
              </span>
              <span className="font-semibold text-ink">{training.training_sections?.length || 0}</span>
              <a href={`${siteUrl}/training/${training.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                /training/{training.slug}
                <ExternalLink size={14} />
              </a>
              <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/trainings/${training.id}/edit`}>
                  <Button className="bg-white text-ink ring-1 ring-line hover:bg-mist">
                    <Pencil size={16} />
                    編集
                  </Button>
                </Link>
                <form action={duplicateAction}>
                  <input type="hidden" name="training_id" value={training.id} />
                  <Button className="bg-white text-ink ring-1 ring-line hover:bg-mist">
                    <Copy size={16} />
                    複製
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
