"use client";

import { useEffect, useRef, useState } from "react";
import type { LandingPageWithImages } from "@/types/lp";

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function getContainedRect(container: HTMLElement, imageWidth: number, imageHeight: number): Rect {
  const box = container.getBoundingClientRect();
  const containerRatio = box.width / box.height;
  const imageRatio = imageWidth / imageHeight;

  if (imageRatio > containerRatio) {
    const width = box.width;
    const height = width / imageRatio;
    return { left: 0, top: (box.height - height) / 2, width, height };
  }

  const height = box.height;
  const width = height * imageRatio;
  return { left: (box.width - width) / 2, top: 0, width, height };
}

export function SwipeLpViewer({ lp }: { lp: LandingPageWithImages }) {
  const fixedHref = lp.cta_url;

  if (lp.lp_images.length === 0) {
    return (
      <main className="grid min-h-svh place-items-center bg-black px-6 text-center text-white">
        <div>
          <p className="text-sm text-white/60">Swipe LP Maker</p>
          <h1 className="mt-3 text-2xl font-semibold">{lp.title}</h1>
          <p className="mt-3 text-sm text-white/70">このLPにはまだスライドがありません。</p>
        </div>
      </main>
    );
  }

  return (
    <main className="lp-scroll" aria-label={lp.title}>
      {lp.lp_images.map((image) => (
        <SwipeSlide key={image.id} image={image} fallbackUrl={lp.cta_url} title={lp.title} />
      ))}
      {lp.fixed_cta_enabled && fixedHref ? (
        <a href={fixedHref} className={`fixed-cta fixed-cta-${lp.fixed_cta_style || "solid"}`}>
          {lp.fixed_cta_label || "詳しく見る"}
        </a>
      ) : null}
    </main>
  );
}

function SwipeSlide({
  image,
  fallbackUrl,
  title,
}: {
  image: LandingPageWithImages["lp_images"][number];
  fallbackUrl: string | null;
  title: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [naturalSize, setNaturalSize] = useState({
    width: image.width || 1080,
    height: image.height || 1920,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    function update() {
      if (!ref.current || !naturalSize.width || !naturalSize.height) {
        setRect(null);
        return;
      }
      setRect(getContainedRect(ref.current, naturalSize.width, naturalSize.height));
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [naturalSize.height, naturalSize.width]);

  return (
    <section ref={ref} className="lp-slide">
      {image.media_type === "video" ? (
        <video
          className="lp-slide-image"
          src={image.public_url}
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          onLoadedMetadata={(event) => {
            const target = event.currentTarget;
            setNaturalSize({ width: target.videoWidth || 1080, height: target.videoHeight || 1920 });
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="lp-slide-image"
          src={image.public_url}
          alt={image.alt_text || title}
          onLoad={(event) => {
            const target = event.currentTarget;
            setNaturalSize({ width: target.naturalWidth, height: target.naturalHeight });
          }}
        />
      )}
      {rect
        ? image.cta_areas.map((area) => {
            const href = area.url || fallbackUrl;
            if (!href) return null;
            return (
              <a
                key={area.id}
                href={href}
                aria-label={area.label || `${title} CTA`}
                className="absolute block"
                style={{
                  left: rect.left + area.x * rect.width,
                  top: rect.top + area.y * rect.height,
                  width: area.width * rect.width,
                  height: area.height * rect.height,
                }}
              />
            );
          })
        : null}
    </section>
  );
}
