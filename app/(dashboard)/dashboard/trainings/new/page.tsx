import { redirect } from "next/navigation";
import { TrainingForm } from "@/components/dashboard/training-form";
import { requireUser } from "@/lib/auth";
import { createTrainingCourse } from "@/lib/trainings";

export default function NewTrainingPage() {
  async function createAction(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const training = await createTrainingCourse(supabase, user.id, formData);
    redirect(`/dashboard/trainings/${training.id}/edit`);
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-ink">研修資料を新規作成</h1>
        <p className="mt-2 text-sm text-slate-600">タイトルと公開URLを決めて、次の画面で章や資料を追加します。</p>
      </div>
      <TrainingForm action={createAction} submitLabel="作成して編集へ" />
    </div>
  );
}
