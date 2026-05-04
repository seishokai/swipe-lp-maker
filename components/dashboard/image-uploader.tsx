"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Images, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

function UploadButton({ selectedCount }: { selectedCount: number }) {
  const { pending } = useFormStatus();

  return (
    <Button className="h-11" disabled={pending || selectedCount === 0}>
      <UploadCloud size={18} />
      {pending ? "追加中..." : selectedCount > 0 ? `${selectedCount}件を追加` : "まとめて追加"}
    </Button>
  );
}

export function ImageUploader({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [selectedCount, setSelectedCount] = useState(0);

  return (
    <form action={action} className="rounded-lg border border-dashed border-accent/45 bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-accent/10 text-accent">
            <Images size={24} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">画像・動画をまとめて追加</h2>
            <p className="mt-1 text-sm text-slate-600">複数ファイルを一気に選べます。追加後、下の一覧で順番を調整できます。</p>
            <p className="mt-1 text-xs text-slate-400">対応: JPG / PNG / WebP / MP4 など</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] md:w-[520px]">
          <input
            id="image"
            name="images"
            type="file"
            accept="image/*,video/*"
            multiple
            required
            onChange={(event) => setSelectedCount(event.currentTarget.files?.length || 0)}
            className="h-11 rounded-md border border-line bg-paper px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
          />
          <UploadButton selectedCount={selectedCount} />
        </div>
      </div>
    </form>
  );
}
