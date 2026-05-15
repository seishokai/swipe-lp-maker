import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { TrainingCourse } from "@/types/training";

export function TrainingForm({
  training,
  action,
  submitLabel = "保存する",
}: {
  training?: TrainingCourse;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="grid gap-5 rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="研修タイトル">
          <Input name="title" defaultValue={training?.title || ""} placeholder="新人研修 / 営業研修 / 広告運用研修" required />
        </Field>
        <Field label="公開URL slug">
          <Input name="slug" defaultValue={training?.slug || ""} placeholder="sales-training" required />
        </Field>
      </div>
      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>説明</span>
        <textarea
          name="description"
          defaultValue={training?.description || ""}
          placeholder="受講者に見せる研修の概要を書きます。"
          className="min-h-28 w-full rounded-md border border-line bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-accent/15"
        />
      </label>
      <div>
        <Button>{submitLabel}</Button>
      </div>
    </form>
  );
}
