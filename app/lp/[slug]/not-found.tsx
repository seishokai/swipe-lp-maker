import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-paper px-5">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-ink">LPが見つかりません</h1>
        <p className="mt-2 text-sm text-slate-600">URLが違うか、現在は非公開です。</p>
        <Link href="/" className="mt-6 inline-flex h-10 items-center rounded-md bg-ink px-4 text-sm font-medium text-white">
          トップへ
        </Link>
      </div>
    </main>
  );
}
