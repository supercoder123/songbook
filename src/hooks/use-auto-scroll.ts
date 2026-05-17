"use client";

import { useEffect, useRef } from "react";

interface UseAutoScrollOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  playing: boolean;
  speed: number;
  useBpm?: boolean;
  bpm?: number;
}

export function useAutoScroll({
  containerRef,
  playing,
  speed,
  useBpm = false,
  bpm = 72,
}: UseAutoScrollOptions) {
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const pixelsPerSecond = useBpm ? (bpm / 60) * 8 : speed;

  useEffect(() => {
    const tick = (time: number) => {
      const container = containerRef.current;
      if (!container || !playing) return;

      if (lastTimeRef.current) {
        const delta = (time - lastTimeRef.current) / 1000;
        container.scrollTop += pixelsPerSecond * delta;

        const maxScroll = container.scrollHeight - container.clientHeight;
        if (container.scrollTop >= maxScroll) {
          container.scrollTop = maxScroll;
        }
      }
      lastTimeRef.current = time;
      rafRef.current = requestAnimationFrame(tick);
    };

    if (playing) {
      lastTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, pixelsPerSecond, playing]);

  return { pixelsPerSecond };
}
