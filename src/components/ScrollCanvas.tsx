"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";

// ─── Configuration ───
const FRAME_COUNT = 100;
const IMAGE_PATH = "/sequence-1/frame-";
const IMAGE_EXT = ".jpg";

export default function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // ─── Track entire document scroll ───
  const { scrollYProgress } = useScroll();

  // Map scroll progress (0→1) to frame index (0→99)
  const frameIndex = useTransform(
    scrollYProgress,
    [0, 1],
    [0, FRAME_COUNT - 1]
  );

  // ─── Reduced motion check ───
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ─── Render a single frame to canvas ───
  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imagesRef.current[index];

    if (!canvas || !ctx || !img) return;

    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let drawWidth: number,
      drawHeight: number,
      offsetX: number,
      offsetY: number;

    if (imgRatio > canvasRatio) {
      drawHeight = canvas.height;
      drawWidth = img.width * (canvas.height / img.height);
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = canvas.width;
      drawHeight = img.height * (canvas.width / img.width);
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  // ─── Preload all images on mount ───
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const loaded: HTMLImageElement[] = [];

      for (let i = 0; i < FRAME_COUNT; i++) {
        const index = i.toString().padStart(2, "0");
        const src = `${IMAGE_PATH}${index}${IMAGE_EXT}`;

        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.src = src;
          image.onload = () => resolve(image);
          image.onerror = reject;
        });

        if (cancelled) return;
        loaded.push(img);
        setLoadProgress(Math.round(((i + 1) / FRAME_COUNT) * 100));
      }

      imagesRef.current = loaded;
      setImagesLoaded(true);
      renderFrame(0);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [renderFrame]);

  // ─── Canvas resize handler ───
  useEffect(() => {
    function handleResize() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      if (imagesRef.current.length > 0) {
        const idx = Math.round(frameIndex.get());
        renderFrame(idx);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imagesLoaded, frameIndex, renderFrame]);

  // ─── Listen to scroll & render corresponding frame ───
  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (imagesLoaded && !prefersReducedMotion) {
      renderFrame(Math.round(latest));
    }
  });

  return (
    <>
      {/* Loading overlay */}
      {!imagesLoaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]">
          <div className="w-48 h-[2px] bg-[#1e1e1e] rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-200 ease-out"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="mt-4 text-[#6b6b6b] text-xs tracking-[0.15em] uppercase">
            Loading — {loadProgress}%
          </p>
        </div>
      )}

      {/* Fixed background canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: 0, display: imagesLoaded ? "block" : "none" }}
        role="img"
        aria-label="Анимация на тенис топки в облаци"
      />


    </>
  );
}
