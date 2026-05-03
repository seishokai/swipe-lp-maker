import Link from "next/link";
import { redirect } from "next/navigation";
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
    <div className="min-h-svh bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/dashboard/lps" className="text-lg font-semibold text-ink">
            Swipe LP Maker
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">{user.email}</div>
            <form action={signOut}>
              <button className="h-9 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink hover:bg-slate-50">
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
