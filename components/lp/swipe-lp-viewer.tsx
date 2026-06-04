"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { Maximize2, Minimize2, Monitor, Smartphone } from "lucide-react";
import type { LandingPageWithImages } from "@/types/lp";

type ViewMode = "phone" | "fill";

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function isLongLpImage(width: number, height: number) {
  return height / Math.max(width, 1) >= 1.9;
}

function getObjectFitRect(element: HTMLElement, mediaWidth: number, mediaHeight: number, mode: ViewMode, longImage: boolean): Rect {
  const box = element.getBoundingClientRect();

  if (longImage) {
    return { left: 0, top: 0, width: box.width, height: box.height };
  }

  const containerRatio = box.width / box.height;
  const mediaRatio = mediaWidth / mediaHeight;
  const shouldFitByWidth = mode === "phone" ? mediaRatio > containerRatio : mediaRatio < containerRatio;

  if (shouldFitByWidth) {
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
  const [viewMode, setViewMode] = useState<ViewMode>("phone");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen();
  }

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
    <main className={`lp-scroll lp-scroll-${viewMode}`} aria-label={lp.title}>
      <div className="lp-view-toolbar" aria-label="表示切替">
        <button
          type="button"
          className={viewMode === "phone" ? "is-active" : ""}
          onClick={() => setViewMode("phone")}
          aria-label="スマホ比率で表示"
        >
          <Smartphone size={16} />
          <span>スマホ比率</span>
        </button>
        <button
          type="button"
          className={viewMode === "fill" ? "is-active" : ""}
          onClick={() => setViewMode("fill")}
          aria-label="画面いっぱいに表示"
        >
          <Monitor size={16} />
          <span>画面いっぱい</span>
        </button>
        <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? "全画面を解除" : "全画面表示"}>
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          <span>{isFullscreen ? "解除" : "全画面"}</span>
        </button>
      </div>

      {images.map((image) => (
        <SwipeSlide key={image.id} image={image} fallbackUrl={lp.cta_url} title={lp.title} viewMode={viewMode} />
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
  viewMode,
}: {
  image: LandingPageWithImages["lp_images"][number];
  fallbackUrl: string | null;
  title: string;
  viewMode: ViewMode;
}) {
  const slideRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [naturalSize, setNaturalSize] = useState({
    width: image.width || 1080,
    height: image.height || 1920,
  });
  const longImage = image.media_type === "image" && isLongLpImage(naturalSize.width, naturalSize.height);
  const ctaAreas = image.cta_areas || [];

  useEffect(() => {
    const media = mediaRef.current;
    if (image.media_type === "image" && media instanceof HTMLImageElement && media.complete && media.naturalWidth > 0) {
      setNaturalSize({ width: media.naturalWidth, height: media.naturalHeight });
    }
  }, [image.media_type, image.public_url]);

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
      const fitted = getObjectFitRect(media, naturalSize.width, naturalSize.height, viewMode, longImage);
      setRect({
        left: mediaBox.left - slideBox.left + fitted.left,
        top: mediaBox.top - slideBox.top + fitted.top,
        width: fitted.width,
        height: fitted.height,
      });
    }

    update();
    const slide = slideRef.current;
    const media = mediaRef.current;
    const observer = new ResizeObserver(update);
    if (slide) observer.observe(slide);
    if (media) observer.observe(media);
    window.addEventListener("orientationchange", update);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("resize", update);
    };
  }, [longImage, naturalSize.height, naturalSize.width, viewMode]);

  return (
    <section ref={slideRef} className={longImage ? "lp-slide lp-slide-long" : "lp-slide"}>
      {!longImage && image.media_type === "video" ? (
        <video className="lp-slide-bg" src={image.public_url} autoPlay muted loop playsInline aria-hidden />
      ) : !longImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="lp-slide-bg" src={image.public_url} alt="" aria-hidden />
      ) : null}

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
          className={longImage ? "lp-slide-image lp-slide-image-long" : "lp-slide-image"}
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
