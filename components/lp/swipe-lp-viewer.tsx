"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { LandingPageWithImages } from "@/types/lp";

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function getContainedRectInside(element: HTMLElement, mediaWidth: number, mediaHeight: number): Rect {
  const box = element.getBoundingClientRect();
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

export function SwipeLpViewer({ lp }: { lp: LandingPageWithImages }) {
  const fixedHref = lp.cta_url;
  const images = [...(lp.lp_images || [])].sort((a, b) => a.sort_order - b.sort_order);

  if (images.length === 0) {
    return (
      <main className="grid min-h-dvh place-items-center bg-black px-6 text-center text-white">
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
      {images.map((image) => (
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
  const slideRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [naturalSize, setNaturalSize] = useState({
    width: image.width || 1080,
    height: image.height || 1920,
  });

  useEffect(() => {
    function update() {
      const slide = slideRef.current;
      const media = mediaRef.current;
      if (!slide || !media || !naturalSize.width || !naturalSize.height) {
        setRect(null);
        return;
      }

      const slideBox = slide.getBoundingClientRect();
      const mediaBox = media.getBoundingClientRect();
      const contained = getContainedRectInside(media, naturalSize.width, naturalSize.height);
      setRect({
        left: mediaBox.left - slideBox.left + contained.left,
        top: mediaBox.top - slideBox.top + contained.top,
        width: contained.width,
        height: contained.height,
      });
    }

    update();
    const slide = slideRef.current;
    const media = mediaRef.current;
    const observer = new ResizeObserver(update);
    if (slide) observer.observe(slide);
    if (media) observer.observe(media);
    window.addEventListener("orientationchange", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", update);
    };
  }, [naturalSize.height, naturalSize.width]);

  const ctaAreas = image.cta_areas || [];

  return (
    <section ref={slideRef} className="lp-slide">
      {image.media_type === "video" ? (
        <video className="lp-slide-bg" src={image.public_url} autoPlay muted loop playsInline aria-hidden />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="lp-slide-bg" src={image.public_url} alt="" aria-hidden />
      )}
      {image.media_type === "video" ? (
        <video
          ref={mediaRef as RefObject<HTMLVideoElement>}
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
          ref={mediaRef as RefObject<HTMLImageElement>}
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
        ? ctaAreas.map((area) => {
            const href = area.url || fallbackUrl;
            if (!href) return null;
            return (
              <a
                key={area.id}
                href={href}
                aria-label={area.label || `${title} CTA`}
                className="absolute z-[2] block"
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
