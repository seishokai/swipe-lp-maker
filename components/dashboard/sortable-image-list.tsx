"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, GripVertical, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LpImage } from "@/types/lp";

export function SortableImageList({
  images,
  moveAction,
  reorderAction,
  deleteAction,
}: {
  images: LpImage[];
  moveAction: (formData: FormData) => Promise<void>;
  reorderAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const initialIds = useMemo(() => images.map((image) => image.id).join(","), [images]);
  const [items, setItems] = useState(images);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const changed = items.map((image) => image.id).join(",") !== initialIds;

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

  return (
    <div className="grid gap-3">
      <form action={reorderAction} className="flex items-center justify-between rounded-lg border border-line bg-white p-3">
        <input type="hidden" name="image_ids" value={items.map((image) => image.id).join(",")} />
        <p className="text-sm text-slate-600">ドラッグ、または上下ボタンで並び替えできます。</p>
        <Button className="h-9" disabled={!changed}>
          <Save size={17} />
          並び順を保存
        </Button>
      </form>

      {items.map((image, index) => (
        <div
          key={image.id}
          draggable
          onDragStart={() => setDraggingId(image.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => onDrop(image.id)}
          className="grid grid-cols-[24px_88px_1fr_auto] items-center gap-4 rounded-lg border border-line bg-white p-3"
        >
          <GripVertical className="text-slate-400" size={20} />
          <div className="relative h-28 w-20 overflow-hidden rounded-md bg-black">
            <Image src={image.public_url} alt={image.alt_text || ""} fill className="object-contain" sizes="80px" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Slide {index + 1}</p>
            <p className="mt-1 break-all text-xs text-slate-500">{image.storage_path}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-ink text-white disabled:opacity-40"
              disabled={index === 0}
              aria-label="上へ"
              onClick={() => moveLocal(index, index - 1)}
            >
              <ArrowUp size={17} />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-ink text-white disabled:opacity-40"
              disabled={index === items.length - 1}
              aria-label="下へ"
              onClick={() => moveLocal(index, index + 1)}
            >
              <ArrowDown size={17} />
            </button>
            <form action={moveAction}>
              <input type="hidden" name="direction" value="up" />
              <input type="hidden" name="image_id" value={image.id} />
              <button className="sr-only">上へ保存</button>
            </form>
            <form action={deleteAction}>
              <input type="hidden" name="image_id" value={image.id} />
              <Button className="h-9 w-9 bg-red-700 px-0 hover:bg-red-800" aria-label="削除">
                <Trash2 size={17} />
              </Button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
