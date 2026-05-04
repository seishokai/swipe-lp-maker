"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Film, GripVertical, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LpImage } from "@/types/lp";

export function SortableImageList({
  images,
  reorderAction,
  deleteAction,
}: {
  images: LpImage[];
  reorderAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const safeImages = useMemo(() => (Array.isArray(images) ? images : []), [images]);
  const initialIds = useMemo(() => safeImages.map((image) => image.id).join(","), [safeImages]);
  const [items, setItems] = useState(safeImages);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const changed = items.map((image) => image.id).join(",") !== initialIds;

  useEffect(() => {
    setItems(safeImages);
  }, [safeImages]);

  function moveLocal(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= items.length) return;
    const next = [...items];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    setItems(next);
  }

  function onDrop(targetId: string) {
    if (!draggingId) return;
    const fromIndex = items.findIndex((image) => image.id === draggingId);
    const toIndex = items.findIndex((image) => image.id === targetId);
    moveLocal(fromIndex, toIndex);
    setDraggingId(null);
  }

  function confirmDelete() {
    const message = changed
      ? "未保存の並び替えがあります。先に並び順を保存しないと、その変更は消えます。このスライドを削除しますか？"
      : "このスライドを削除しますか？設定済みの画像内CTAも一緒に削除されます。";
    return window.confirm(message);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold text-ink">まだスライドがありません</p>
        <p className="mt-1 text-sm text-slate-500">上の追加エリアから画像や動画をまとめてアップロードできます。</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <form action={reorderAction} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white p-4 shadow-soft">
        <input type="hidden" name="image_ids" value={items.map((image) => image.id).join(",")} />
        <div>
          <p className="text-sm font-semibold text-ink">スライド一覧</p>
          <p className="mt-1 text-xs text-slate-500">ドラッグ、または矢印ボタンで順番を変えられます。変更後は保存してください。</p>
        </div>
        <Button className={changed ? "h-10" : "h-10 bg-slate-200 text-slate-500 hover:bg-slate-200"} disabled={!changed}>
          {changed ? <Save size={17} /> : <Check size={17} />}
          {changed ? "並び順を保存" : "保存済み"}
        </Button>
      </form>

      {changed ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
          並び順に未保存の変更があります。削除や別タブでの作業前に保存してください。
        </p>
      ) : null}

      <div className="grid gap-3">
        {items.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => setDraggingId(image.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => onDrop(image.id)}
            className={`grid grid-cols-[28px_92px_1fr] gap-4 rounded-lg border bg-white p-3 shadow-soft transition md:grid-cols-[28px_92px_1fr_auto] md:items-center ${
              draggingId === image.id ? "border-accent ring-4 ring-accent/10" : "border-line"
            }`}
          >
            <button
              type="button"
              className="mt-8 grid h-9 w-7 cursor-grab place-items-center rounded-md text-slate-400 hover:bg-mist hover:text-ink md:mt-0"
              aria-label="ドラッグで並び替え"
            >
              <GripVertical size={20} />
            </button>

            <div className="relative h-32 w-24 overflow-hidden rounded-md bg-black ring-1 ring-line">
              {image.media_type === "video" ? (
                <>
                  <video src={image.public_url} muted playsInline className="h-full w-full object-contain" />
                  <span className="absolute right-1 top-1 rounded bg-black/70 p-1 text-white">
                    <Film size={13} />
                  </span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.public_url} alt={image.alt_text || ""} className="h-full w-full object-contain" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-ink">Slide {index + 1}</p>
                <span className="rounded-full bg-mist px-2 py-1 text-xs font-semibold text-slate-600">
                  {image.media_type === "video" ? "動画" : "画像"}
                </span>
              </div>
              <p className="mt-2 truncate text-xs text-slate-400">{image.storage_path}</p>
              <p className="mt-2 text-xs text-slate-500">CTAを置く場合は「CTAエリア」タブで、このスライドを選んでください。</p>
            </div>

            <div className="col-span-3 flex flex-wrap justify-end gap-2 md:col-span-1">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-mist text-ink disabled:opacity-40"
                disabled={index === 0}
                aria-label="上へ移動"
                onClick={() => moveLocal(index, index - 1)}
              >
                <ArrowUp size={17} />
              </button>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-mist text-ink disabled:opacity-40"
                disabled={index === items.length - 1}
                aria-label="下へ移動"
                onClick={() => moveLocal(index, index + 1)}
              >
                <ArrowDown size={17} />
              </button>
              <form
                action={deleteAction}
                onSubmit={(event) => {
                  if (!confirmDelete()) event.preventDefault();
                }}
              >
                <input type="hidden" name="image_id" value={image.id} />
                <Button className="h-10 bg-red-700 px-3 hover:bg-red-800" aria-label="削除">
                  <Trash2 size={17} />
                  削除
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
