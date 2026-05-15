import { ArrowDown, ArrowUp, FileText, Film, ImageIcon, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrainingAssetUploader } from "@/components/dashboard/training-asset-uploader";
import type { TrainingCourseWithSections } from "@/types/training";

export function TrainingSectionEditor({
  course,
  userId,
  createSectionAction,
  updateSectionAction,
  deleteSectionAction,
  reorderSectionAction,
  deleteAssetAction,
}: {
  course: TrainingCourseWithSections;
  userId: string;
  createSectionAction: (formData: FormData) => Promise<void>;
  updateSectionAction: (formData: FormData) => Promise<void>;
  deleteSectionAction: (formData: FormData) => Promise<void>;
  reorderSectionAction: (formData: FormData) => Promise<void>;
  deleteAssetAction: (formData: FormData) => Promise<void>;
}) {
  const sections = [...(course.training_sections || [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="grid gap-5">
      <form action={createSectionAction} className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft">
        <div>
          <h2 className="text-lg font-semibold text-ink">セクション追加</h2>
          <p className="mt-1 text-sm text-slate-500">研修を章ごとに分けて作れます。動画、画像、PDFは各セクションに追加します。</p>
        </div>
        <Input name="title" placeholder="例: 1. 広告運用の基本" required />
        <textarea
          name="body"
          placeholder="本文、補足、受講者への指示を書きます。"
          className="min-h-32 rounded-md border border-line bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-accent/15"
        />
        <Button className="w-fit">セクションを追加</Button>
      </form>

      {sections.length > 0 ? (
        <form action={reorderSectionAction} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white p-4 shadow-soft">
          <input type="hidden" name="section_ids" value={sections.map((section) => section.id).join(",")} />
          <p className="text-sm text-slate-600">セクションの順番は上下ボタンで保存できます。</p>
          <Button>
            <Save size={16} />
            現在の順番を保存
          </Button>
        </form>
      ) : null}

      <div className="grid gap-4">
        {sections.map((section, index) => {
          const assets = [...(section.training_assets || [])].sort((a, b) => a.sort_order - b.sort_order);
          const upIds = [...sections];
          const downIds = [...sections];
          if (index > 0) [upIds[index - 1], upIds[index]] = [upIds[index], upIds[index - 1]];
          if (index < sections.length - 1) [downIds[index + 1], downIds[index]] = [downIds[index], downIds[index + 1]];

          return (
            <section key={section.id} className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-accent">SECTION {index + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-ink">{section.title}</h3>
                </div>
                <div className="flex gap-2">
                  <form action={reorderSectionAction}>
                    <input type="hidden" name="section_ids" value={upIds.map((item) => item.id).join(",")} />
                    <button className="grid h-9 w-9 place-items-center rounded-md bg-mist text-ink disabled:opacity-40" disabled={index === 0} aria-label="上へ">
                      <ArrowUp size={16} />
                    </button>
                  </form>
                  <form action={reorderSectionAction}>
                    <input type="hidden" name="section_ids" value={downIds.map((item) => item.id).join(",")} />
                    <button className="grid h-9 w-9 place-items-center rounded-md bg-mist text-ink disabled:opacity-40" disabled={index === sections.length - 1} aria-label="下へ">
                      <ArrowDown size={16} />
                    </button>
                  </form>
                  <form action={deleteSectionAction}>
                    <input type="hidden" name="section_id" value={section.id} />
                    <Button className="h-9 bg-red-700 px-3 hover:bg-red-800">
                      <Trash2 size={15} />
                      削除
                    </Button>
                  </form>
                </div>
              </div>

              <form action={updateSectionAction} className="grid gap-3">
                <input type="hidden" name="section_id" value={section.id} />
                <Input name="title" defaultValue={section.title} required />
                <textarea
                  name="body"
                  defaultValue={section.body || ""}
                  className="min-h-32 rounded-md border border-line bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-accent/15"
                />
                <Button className="w-fit">セクションを保存</Button>
              </form>

              <div className="mt-5 grid gap-3">
                <h4 className="text-sm font-semibold text-ink">資料ファイル</h4>
                <TrainingAssetUploader userId={userId} courseId={course.id} sectionId={section.id} />
                {assets.length > 0 ? (
                  <div className="grid gap-2">
                    {assets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between gap-3 rounded-md border border-line bg-mist/45 px-3 py-2">
                        <a href={asset.public_url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink">
                          {asset.asset_type === "image" ? <ImageIcon size={16} /> : asset.asset_type === "video" ? <Film size={16} /> : <FileText size={16} />}
                          <span className="truncate">{asset.file_name || asset.storage_path}</span>
                        </a>
                        <form action={deleteAssetAction}>
                          <input type="hidden" name="asset_id" value={asset.id} />
                          <button className="grid h-8 w-8 place-items-center rounded-md bg-red-700 text-white" aria-label="資料削除">
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md bg-mist px-3 py-2 text-sm text-slate-500">まだ資料ファイルはありません。</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
