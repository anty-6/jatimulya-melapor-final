"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface PhotoPreviewProps {
  urls: string[];
}

export default function PhotoPreview({ urls }: PhotoPreviewProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const prevIndex = useRef<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const goTo = useCallback(
    (index: number) => {
      setImgLoading(true);
      setActiveIndex(index);
    },
    []
  );

  const prev = useCallback(
    () => goTo((activeIndex! - 1 + urls.length) % urls.length),
    [activeIndex, urls.length, goTo]
  );

  const next = useCallback(
    () => goTo((activeIndex! + 1) % urls.length),
    [activeIndex, urls.length, goTo]
  );

  // Keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, close, prev, next]);

  // Preload adjacent images when lightbox is open
  useEffect(() => {
    if (activeIndex === null || urls.length <= 1) return;
    const toPreload = [
      urls[(activeIndex + 1) % urls.length],
      urls[(activeIndex - 1 + urls.length) % urls.length],
    ];
    toPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [activeIndex, urls]);

  // Show spinner only when index actually changed
  useEffect(() => {
    if (activeIndex !== null && activeIndex !== prevIndex.current) {
      setImgLoading(true);
    }
    prevIndex.current = activeIndex;
  }, [activeIndex]);

  return (
    <>
      {/* Thumbnails */}
      <div className="flex gap-1">
        {urls.slice(0, 3).map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={url}
            alt={`Foto ${i + 1}`}
            onClick={() => goTo(i)}
            className="h-10 w-10 cursor-pointer rounded object-cover border border-gray-200 hover:opacity-80 transition-opacity"
          />
        ))}
        {urls.length > 3 && (
          <button
            onClick={() => goTo(3)}
            className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 bg-gray-100 text-xs text-gray-500 hover:bg-gray-200 transition-colors"
          >
            +{urls.length - 3}
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 text-xl transition-colors"
          >
            ×
          </button>

          {/* Counter */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white select-none">
            {activeIndex + 1} / {urls.length}
          </span>

          {/* Prev */}
          {urls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 text-2xl transition-colors select-none"
            >
              ‹
            </button>
          )}

          {/* Image area */}
          <div
            className="relative flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Spinner saat loading */}
            {imgLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeIndex}
              src={urls[activeIndex]}
              alt={`Foto ${activeIndex + 1}`}
              onLoad={() => setImgLoading(false)}
              className={`max-h-[82vh] max-w-[88vw] rounded-lg object-contain shadow-2xl transition-opacity duration-200 ${
                imgLoading ? "opacity-0" : "opacity-100"
              }`}
            />
          </div>

          {/* Next */}
          {urls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 text-2xl transition-colors select-none"
            >
              ›
            </button>
          )}

          {/* Strip thumbnail bawah */}
          {urls.length > 1 && (
            <div
              className="absolute bottom-4 flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {urls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`thumb ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-12 w-12 cursor-pointer rounded object-cover border-2 transition-all duration-150 ${
                    i === activeIndex
                      ? "border-white opacity-100 scale-110"
                      : "border-transparent opacity-50 hover:opacity-75"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
