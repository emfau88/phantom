import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import type { ScreenRect } from '../scene/grid/distortion';

export function CaseMorph({ origin, image, opening, reducedMotion, onComplete }: { origin: ScreenRect; image?: string; opening: boolean; reducedMotion: boolean; onComplete: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const target = { left: 0, top: 0, width: window.innerWidth, height: Math.min(Math.max(window.innerHeight * 0.78, 520), 820) };
    const from = opening ? origin : target;
    const to = opening ? target : origin;
    gsap.set(element, { ...from, borderRadius: opening ? 1 : 0, opacity: 1 });
    const tween = gsap.to(element, { ...to, borderRadius: opening ? 0 : 1, duration: reducedMotion ? 0.05 : 0.72, ease: 'power3.inOut', onComplete });
    return () => { tween.kill(); };
  }, [onComplete, opening, origin, reducedMotion]);
  return <div ref={ref} className="case-morph" aria-hidden="true">{image && <img src={image} alt="" />}</div>;
}
