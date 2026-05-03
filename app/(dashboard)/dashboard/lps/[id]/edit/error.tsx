"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditLpError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-5">
      <div className="w-full max-w-lg rounded-lg border border-line bg-white p-6 text-center shadow-soft">
        <p className="text-sm font-semibold text-accent">Swipe LP Maker</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">編集画面の読み込みに失敗しました</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          一時的に古い画面データが残っている可能性があります。再読み込みすると復帰できます。
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button onClick={() => reset()}>
            <RotateCcw size={18} />
            もう一度読み込む
          </Button>
        </div>
      </div>
    </div>
  );
}
