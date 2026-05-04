"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Film, MousePointer2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { LandingPageWithImages } from "@/types/lp";

type RatioRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PixelRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function getContainedRect(container: HTMLElement, mediaWidth: number, mediaHeight: number): PixelRect {
  const box = container.getBoundingClientRect();
  const containerRatio = box.width / box.height;
  const mediaRatio = mediaWidth / mediaHeight;

  if (mediaRatio > containerRatio) {
    const width = box.width;
    const height = width / mediaRatio;
    return { left: 0, top: (box.height - height) / 2, width, height };
  }

  const height = box.height;
  const width = height * mediaRatio;
  return { left: (box.width - width) / 2, top: 0, width, height };
}

export function CtaAreaEditor({
  lp,
  action,
  deleteAction,
}: {
  lp: LandingPageWithImages;
  action: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const images = useMemo(
    () =>
      (Array.isArray(lp.lp_images) ? lp.lp_images : []).map((image) => ({
        ...image,
        cta_areas: image.cta_areas || [],
      })),
    [lp.lp_images],
  );
  const [selectedId, setSelectedId] = useState(images[0]?.id);
  const selectedImage = images.find((image) => image.id === selectedId) || images[0];

  if (!selectedImage) {
    return (
      <div className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold text-ink">CTAを設定するスライドがありません</p>
        <p className="mt-1 text-sm text-slate-500">先に「画像・動画」タブからスライドを追加してください。</p>
      </div>
    );
  }

  return (
    <section className="grid gap-4 rounded-lg border border-line bg-white p-4 shadow-soft xl:grid-cols-[280px_1fr]">
      <div className="grid content-start gap-3">
        <div className="rounded-md bg-mist p-3">
          <p className="text-sm font-semibold text-ink">編集するスライド</p>
          <p className="mt-1 text-xs text-slate-500">スライドを選び、右側のプレビュー上をドラッグしてクリック範囲を作ります。</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedId(image.id)}
              className={`grid grid-cols-[48px_1fr] items-center gap-3 rounded-md border p-2 text-left transition ${
                selectedImage.id === image.id ? "border-accent bg-accent/5 ring-4 ring-accent/10" : "border-line bg-white hover:bg-mist"
              }`}
            >
              <div className="relative h-16 w-12 overflow-hidden rounded bg-black">
                {image.media_type === "video" ? (
                  <>
                    <video src={image.public_url} muted playsInline className="h-full w-full object-contain" />
                    <span className="absolute right-1 top-1 rounded bg-black/70 p-0.5 text-white">
                      <Film size={10} />
                    </span>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image.public_url} alt={image.alt_text || ""} className="h-full w-full object-contain" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">Slide {index + 1}</p>
                <p className="mt-1 text-xs text-slate-500">{image.cta_areas.length} CTA</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <CtaAreaSlide
        key={selectedImage.id}
        lp={lp}
        image={selectedImage}
        index={images.findIndex((image) => image.id === selectedImage.id)}
        action={action}
        deleteAction={deleteAction}
      />
    </section>
  );
}

function CtaAreaSlide({
  lp,
  image,
  index,
  action,
  deleteAction,
}: {
  lp: LandingPageWithImages;
  image: LandingPageWithImages["lp_images"][number];
  index: number;
  action: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const areas = image.cta_areas || [];
  const [mediaSize, setMediaSize] = useState({ width: image.width || 1080, height: image.height || 1920 });
  const [displayRect, setDisplayRect] = useState<PixelRect | null>(null);
  const [draft, setDraft] = useState<RatioRect>({ x: 0.15, y: 0.7, width: 0.7, height: 0.12 });

  useEffect(() => {
    setMediaSize({ width: image.width || 1080, height: image.height || 1920 });
    setDisplayRect(null);
    setDraft({ x: 0.15, y: 0.7, width: 0.7, height: 0.12 });
    startRef.current = null;
  }, [image.height, image.id, image.width]);

  function updateDisplayRect(nextSize = mediaSize) {
    if (previewRef.current) {
      setDisplayRect(getContainedRect(previewRef.current, nextSize.width, nextSize.height));
    }
  }

  function toMediaPoint(clientX: number, clientY: number) {
    const preview = previewRef.current;
    if (!preview) return null;

    const box = preview.getBoundingClientRect();
    const rect = getContainedRect(preview, mediaSize.width, mediaSize.height);
    setDisplayRect(rect);
    return {
      x: clamp((clientX - box.left - rect.left) / rect.width),
      y: clamp((clientY - box.top - rect.top) / rect.height),
    };
  }

  function startDraw(event: React.PointerEvent<HTMLDivElement>) {
    const point = toMediaPoint(event.clientX, event.clientY);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    startRef.current = point;
    setDraft({ x: point.x, y: point.y, width: 0.01, height: 0.01 });
  }

  function moveDraw(event: React.PointerEvent<HTMLDivElement>) {
    if (!startRef.current) return;
    const point = toMediaPoint(event.clientX, event.clientY);
    if (!point) return;
    const x = Math.min(startRef.current.x, point.x);
    const y = Math.min(startRef.current.y, point.y);
    setDraft({
      x,
      y,
      width: Math.min(Math.max(0.01, Math.abs(point.x - startRef.current.x)), 1 - x),
      height: Math.min(Math.max(0.01, Math.abs(point.y - startRef.current.y)), 1 - y),
    });
  }

  function renderArea(area: RatioRect) {
    const rect = displayRect;
    if (!rect) {
      return {
        left: `${area.x * 100}%`,
        top: `${area.y * 100}%`,
        width: `${area.width * 100}%`,
        height: `${area.height * 100}%`,
      };
    }
    return {
      left: rect.left + area.x * rect.width,
      top: rect.top + area.y * rect.height,
      width: area.width * rect.width,
      height: area.height * rect.height,
    };
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">
            Slide {index + 1} / {image.media_type === "video" ? "動画" : "画像"}
          </p>
          <span className="rounded-full bg-mist px-2 py-1 text-xs font-semibold text-slate-500">{areas.length} CTA</span>
        </div>

        <div
          ref={previewRef}
          className="relative h-[520px] touch-none overflow-hidden rounded-md bg-black"
          onPointerDown={startDraw}
          onPointerMove={moveDraw}
          onPointerUp={() => (startRef.current = null)}
          onPointerCancel={() => (startRef.current = null)}
        >
          {image.media_type === "video" ? (
            <video
              src={image.public_url}
              muted
              loop
              playsInline
              className="h-full w-full object-contain"
              onLoadedMetadata={(event) => {
                const nextSize = {
                  width: event.currentTarget.videoWidth || 1080,
                  height: event.currentTarget.videoHeight || 1920,
                };
                setMediaSize(nextSize);
                updateDisplayRect(nextSize);
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.public_url}
              alt={image.alt_text || ""}
              className="h-full w-full object-contain"
              onLoad={(event) => {
                const nextSize = { width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight };
                setMediaSize(nextSize);
                updateDisplayRect(nextSize);
              }}
              draggable={false}
            />
          )}
          {areas.map((area) => (
            <span key={area.id} className="pointer-events-none absolute border-2 border-white bg-white/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.05)]" style={renderArea(area)} />
          ))}
          <span className="pointer-events-none absolute border-2 border-accent bg-accent/25" style={renderArea(draft)} />
        </div>

        <p className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500">
          <MousePointer2 size={14} />
          画像の上でドラッグすると、クリックできる透明リンク範囲を作れます。
        </p>
      </div>

      <div className="grid content-start gap-4">
        <div className="rounded-md bg-mist p-4">
          <p className="text-sm font-semibold text-ink">
            予定範囲: x {draft.x.toFixed(3)}, y {draft.y.toFixed(3)}, 幅 {draft.width.toFixed(3)}, 高さ {draft.height.toFixed(3)}
          </p>
          <p className="mt-1 text-xs text-slate-500">下の数値で細かく調整できます。</p>
        </div>

        {areas.length > 0 ? (
          <div className="grid gap-2">
            {areas.map((area) => (
              <div key={area.id} className="flex items-center justify-between gap-3 rounded-md border border-line bg-white px-3 py-2 text-sm text-slate-700">
                <div>
                  <p className="font-semibold text-ink">{area.label || "CTA"}</p>
                  <p className="mt-1 text-xs text-slate-500">x {area.x}, y {area.y}, 幅 {area.width}, 高さ {area.height}</p>
                </div>
                <form
                  action={deleteAction}
                  onSubmit={(event) => {
                    if (!window.confirm("このCTAエリアを削除しますか？")) event.preventDefault();
                  }}
                >
                  <input type="hidden" name="cta_area_id" value={area.id} />
                  <Button className="h-9 w-9 bg-red-700 px-0 hover:bg-red-800" aria-label="CTAを削除">
                    <Trash2 size={15} />
                  </Button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-line bg-white p-4 text-sm text-slate-500">このスライドにはまだCTAエリアがありません。</p>
        )}

        <form action={action} className="grid gap-3 rounded-md border border-line bg-white p-4">
          <input type="hidden" name="lp_image_id" value={image.id} />
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="ラベル">
              <Input name="label" placeholder="申込ボタン" />
            </Field>
            <Field label="個別URL">
              <Input name="url" type="url" required={!lp.cta_url} placeholder={lp.cta_url || "https://example.com"} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Field label="x">
              <Input name="x" type="number" min="0" max="1" step="0.001" value={draft.x.toFixed(3)} onChange={(event) => setDraft({ ...draft, x: Number(event.target.value) })} />
            </Field>
            <Field label="y">
              <Input name="y" type="number" min="0" max="1" step="0.001" value={draft.y.toFixed(3)} onChange={(event) => setDraft({ ...draft, y: Number(event.target.value) })} />
            </Field>
            <Field label="幅">
              <Input name="width" type="number" min="0.001" max="1" step="0.001" value={draft.width.toFixed(3)} onChange={(event) => setDraft({ ...draft, width: Number(event.target.value) })} />
            </Field>
            <Field label="高さ">
              <Input name="height" type="number" min="0.001" max="1" step="0.001" value={draft.height.toFixed(3)} onChange={(event) => setDraft({ ...draft, height: Number(event.target.value) })} />
            </Field>
          </div>
          <Button className="w-fit">
            <Plus size={18} />
            CTAエリアを追加
          </Button>
        </form>
      </div>
    </div>
  );
}
