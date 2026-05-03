"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  return (
    <div className="grid gap-5">
      {lp.lp_images.map((image, index) => (
        <CtaAreaSlide key={image.id} lp={lp} image={image} index={index} action={action} deleteAction={deleteAction} />
      ))}
    </div>
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
  const [mediaSize, setMediaSize] = useState({ width: image.width || 1080, height: image.height || 1920 });
  const [displayRect, setDisplayRect] = useState<PixelRect | null>(null);
  const [draft, setDraft] = useState<RatioRect>({ x: 0.15, y: 0.7, width: 0.7, height: 0.12 });

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

  function updateDisplayRect(nextSize = mediaSize) {
    if (previewRef.current) {
      setDisplayRect(getContainedRect(previewRef.current, nextSize.width, nextSize.height));
    }
  }

  return (
    <section className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft lg:grid-cols-[280px_1fr]">
      <div>
        <p className="mb-3 text-sm font-semibold text-ink">Slide {index + 1} / {image.media_type === "video" ? "動画" : "画像"}</p>
        <div
          ref={previewRef}
          className="relative h-[430px] touch-none overflow-hidden rounded-md bg-black"
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
              controls
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
          {image.cta_areas.map((area) => (
            <span key={area.id} className="pointer-events-none absolute border-2 border-white bg-white/20" style={renderArea(area)} />
          ))}
          <span className="pointer-events-none absolute border-2 border-accent bg-accent/25" style={renderArea(draft)} />
        </div>
        <p className="mt-2 text-xs text-slate-500">プレビュー上をドラッグするとCTA範囲を作れます。</p>
      </div>

      <div className="grid content-start gap-4">
        {image.cta_areas.length > 0 ? (
          <div className="grid gap-2">
            {image.cta_areas.map((area) => (
              <div key={area.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
                <p>{area.label || "CTA"}: x {area.x}, y {area.y}, w {area.width}, h {area.height}</p>
                <form action={deleteAction}>
                  <input type="hidden" name="cta_area_id" value={area.id} />
                  <Button className="h-8 w-8 bg-red-700 px-0 hover:bg-red-800" aria-label="CTA削除">
                    <Trash2 size={15} />
                  </Button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">CTAエリアは未設定です。</p>
        )}

        <form action={action} className="grid gap-3">
          <input type="hidden" name="lp_image_id" value={image.id} />
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="ラベル">
              <Input name="label" placeholder="申込ボタン" />
            </Field>
            <Field label="個別URL">
              <Input name="url" type="url" placeholder={lp.cta_url || "https://example.com"} />
            </Field>
          </div>
          <div className="grid grid-cols-4 gap-3">
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
            CTAエリア追加
          </Button>
        </form>
      </div>
    </section>
  );
}
