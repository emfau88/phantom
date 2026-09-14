import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import type { ScreenRect } from '../scene/grid/distortion';

interface CaseMorphProps {
  origin: ScreenRect;
  image?: string;
  opening: boolean;
  reducedMotion: boolean;
  onProgress?: (progress: number) => void;
  onComplete: () => void;
}

export function CaseMorph({
  origin,
  image,
  opening,
  reducedMotion,
  onProgress,
  onComplete,
}: CaseMorphProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const target = { left: 0, top: 0, width: window.innerWidth, height: Math.min(Math.max(window.innerHeight * 0.78, 520), 820) };
    const from = opening ? origin : target;
    const to = opening ? target : origin;
    const duration = reducedMotion ? 0.05 : 0.72;
    const progress = { value: opening ? 0 : 1 };
    gsap.set(element, { ...from, borderRadius: opening ? 1 : 0, opacity: 1 });
    onProgress?.(progress.value);
    const timeline = gsap.timeline({
      onUpdate: () => onProgress?.(progress.value),
      onComplete,
    });
    timeline.to(element, { ...to, borderRadius: opening ? 0 : 1, duration, ease: 'power3.inOut' }, 0);
    timeline.to(progress, { value: opening ? 1 : 0, duration, ease: 'power3.inOut' }, 0);
    return () => { timeline.kill(); };
  }, [onComplete, onProgress, opening, origin, reducedMotion]);
  return (
    <div
      ref={ref}
      className="case-morph"
      aria-hidden="true"
      data-testid="case-morph"
      data-origin-left={origin.left}
      data-origin-top={origin.top}
      data-origin-width={origin.width}
      data-origin-height={origin.height}
    >
      {image && <img src={image} alt="" />}
    </div>
  );
}
