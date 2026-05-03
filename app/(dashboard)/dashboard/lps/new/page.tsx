import { redirect } from "next/navigation";
import { LpForm } from "@/components/dashboard/lp-form";
import { requireUser } from "@/lib/auth";
import { createLandingPage } from "@/lib/lps";

export default function NewLpPage() {
  async function action(formData: FormData) {
    "use server";
    const { supabase, user } = await requireUser();
    const lp = await createLandingPage(supabase, user.id, formData);
    redirect(`/dashboard/lps/${lp.id}/edit`);
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">LP新規作成</h1>
        <p className="mt-1 text-sm text-slate-600">まずはタイトル、slug、CTA URLを設定します。</p>
      </div>
      <LpForm action={action} />
    </div>
  );
}
