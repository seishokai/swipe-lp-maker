"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicUrlPanel({
  url,
  published,
}: {
  url: string;
  published: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-ink">公開URL</h2>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${published ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-600"}`}>
              {published ? "公開中" : "非公開"}
            </span>
          </div>
          <p className="mt-2 break-all text-sm text-slate-600">{url}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="bg-white text-ink ring-1 ring-line hover:bg-mist" onClick={copyUrl}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "コピー済み" : "コピー"}
          </Button>
          {published ? (
            <a href={url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black">
              <ExternalLink size={18} />
              公開ページを見る
            </a>
          ) : (
            <span className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-200 px-4 text-sm font-semibold text-slate-500">
              <ExternalLink size={18} />
              公開後に確認
            </span>
          )}
        </div>
      </div>
      {published ? (
        <div className="mt-4 hidden justify-center md:flex">
          <div className="h-[560px] w-[280px] overflow-hidden rounded-[28px] border-8 border-ink bg-black shadow-xl">
            <iframe title="LPプレビュー" src={url} className="h-full w-full border-0 bg-black" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
