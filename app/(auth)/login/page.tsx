import { CheckCircle2, Layers3, Smartphone } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#f5f7fb]">
      <div className="mx-auto grid min-h-svh w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_440px]">
        <section className="hidden lg:block">
          <p className="text-sm font-bold text-accent">Swipe LP Maker</p>
          <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-tight tracking-normal text-ink">
            スマホ広告LPを、画像を並べるだけで公開。
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
            Instagramストーリーのように縦スワイプできるLPを、管理画面から作成・編集・公開できます。
          </p>
          <div className="mt-8 grid max-w-xl gap-3">
            {["画像・動画をまとめてアップロード", "画像内の好きな位置にCTAリンク", "Meta Pixel / Google Analytics 対応"].map((text) => (
              <div key={text} className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-soft">
                <CheckCircle2 className="text-accent" size={20} />
                <span className="text-sm font-semibold text-ink">{text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-[440px]">
          <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-slate-300/50 blur-3xl" />
          <div className="relative">
            <div className="mb-6">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-ink shadow-sm">
                <Smartphone size={15} className="text-accent" />
                Swipe LP Maker
              </div>
              <h2 className="text-4xl font-semibold tracking-normal text-ink">ログイン</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                LPの作成、画像追加、公開設定をここから管理します。
              </p>
            </div>
            <LoginForm />
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Layers3 size={14} />
              管理者用の画面です。公開LPはログイン不要で表示されます。
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
