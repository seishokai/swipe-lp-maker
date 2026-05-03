import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-paper px-5">
      <section className="w-full max-w-md">
        <div className="mb-6">
          <p className="text-sm font-medium text-accent">Swipe LP Maker</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink">パスワード再設定</h1>
        </div>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
