import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Images } from "lucide-react";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();

  async function signOut() {
    "use server";
    const { supabase } = await requireUser();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/dashboard/lps" className="flex items-center gap-3 text-lg font-semibold text-ink">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-ink text-sm text-white">SL</span>
            <span>Swipe LP Maker</span>
          </Link>
          <nav className="flex flex-1 flex-wrap items-center gap-2 md:ml-6">
            <Link href="/dashboard/lps" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-600 transition hover:bg-mist hover:text-ink">
              <Images size={16} />
              LP管理
            </Link>
            <Link href="/dashboard/trainings" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-600 transition hover:bg-mist hover:text-ink">
              <BookOpen size={16} />
              研修資料
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-sm text-slate-600 sm:block">{user.email}</div>
            <form action={signOut}>
              <button className="h-9 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink transition hover:bg-slate-50">
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
}
