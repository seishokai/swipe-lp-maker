import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5 py-10">
      <section className="w-full max-w-[440px]">
        <div className="mb-6">
          <p className="text-sm font-semibold text-accent">Swipe LP Maker</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal text-ink">ログイン</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            画像・動画を並べるだけで、スマホ向けの縦スワイプLPを作成できます。
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
