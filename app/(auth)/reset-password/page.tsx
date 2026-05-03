import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5 py-10">
      <section className="w-full max-w-[440px]">
        <div className="mb-6">
          <p className="text-sm font-semibold text-accent">Swipe LP Maker</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal text-ink">パスワード再設定</h1>
        </div>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
