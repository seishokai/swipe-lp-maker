"use client";

import { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
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
    <section className="grid gap-4 rounded-lg border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">公開URL</h2>
          <p className="mt-1 break-all text-sm text-slate-600">{url}</p>
          <p className="mt-2 text-sm text-slate-500">
            {published ? "現在公開中です。" : "現在は非公開です。公開するとこのURLで表示できます。"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" className="bg-slate-700 hover:bg-slate-800" onClick={copyUrl}>
            <Copy size={18} />
            {copied ? "コピー済み" : "コピー"}
          </Button>
          <a href={url} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white">
            <ExternalLink size={18} />
            開く
          </a>
        </div>
      </div>
      <div className="mx-auto h-[560px] w-[280px] overflow-hidden rounded-[28px] border-8 border-ink bg-black shadow-xl">
        <iframe title="LPプレビュー" src={url} className="h-full w-full border-0 bg-black" />
      </div>
    </section>
  );
}
