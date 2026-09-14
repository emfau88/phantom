import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export interface MediaGalleryItem {
  src: string;
  alt: string;
  caption: string;
}

interface MediaGalleryProps {
  items: MediaGalleryItem[];
  label: string;
  reducedMotion: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function MediaGallery({ items, label, reducedMotion }: MediaGalleryProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const stepRef = useRef(1);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const wheelTimerRef = useRef<number | null>(null);
  const pointerRef = useRef({
    active: false,
    id: -1,
    startX: 0,
    originX: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const syncVisuals = useCallback((nextX: number, velocity = 0) => {
    const track = trackRef.current;
    if (!track) return;
    xRef.current = nextX;
    track.style.transform = `translate3d(${nextX}px, 0, 0)`;
    const position = clamp(-nextX / Math.max(stepRef.current, 1), 0, Math.max(0, items.length - 1));
    const nextIndex = clamp(Math.round(position), 0, Math.max(0, items.length - 1));
    if (nextIndex !== activeIndexRef.current) {
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }
    const velocityTilt = reducedMotion ? 0 : clamp(velocity * 0.12, -0.7, 0.7);
    Array.from(track.children).forEach((child, index) => {
      if (!(child instanceof HTMLElement)) return;
      const distance = Math.min(1, Math.abs(index - position));
      child.style.setProperty('--gallery-scale', String(1 - distance * 0.045));
      child.style.setProperty('--gallery-opacity', String(1 - distance * 0.3));
      child.style.setProperty('--gallery-tilt', `${velocityTilt * (index < position ? -1 : 1)}deg`);
    });
  }, [items.length, reducedMotion]);

  const snapTo = useCallback((index: number, velocity = 0) => {
    const safeIndex = clamp(index, 0, Math.max(0, items.length - 1));
    const target = -safeIndex * stepRef.current;
    tweenRef.current?.kill();
    if (reducedMotion) {
      syncVisuals(target);
      return;
    }
    const proxy = { x: xRef.current };
    const distance = Math.abs(target - proxy.x);
    tweenRef.current = gsap.to(proxy, {
      x: target,
      duration: clamp(0.42 + distance / 1900 + Math.abs(velocity) * 0.035, 0.42, 0.82),
      ease: 'power3.out',
      onUpdate: () => syncVisuals(proxy.x, velocity * (1 - Math.abs(target - proxy.x) / Math.max(distance, 1))),
      onComplete: () => {
        tweenRef.current = null;
        syncVisuals(target);
      },
    });
  }, [items.length, reducedMotion, syncVisuals]);

  const measure = useCallback(() => {
    const track = trackRef.current;
    const first = track?.firstElementChild;
    if (!track || !(first instanceof HTMLElement)) return;
    const styles = getComputedStyle(track);
    stepRef.current = first.offsetWidth + Number.parseFloat(styles.columnGap || styles.gap) || first.offsetWidth;
    syncVisuals(-activeIndexRef.current * stepRef.current);
  }, [syncVisuals]);

  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const onWheel = (event: WheelEvent) => {
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 0.55
        ? event.deltaX
        : event.shiftKey ? event.deltaY : 0;
      if (!horizontal || items.length < 2) return;
      event.preventDefault();
      tweenRef.current?.kill();
      const minimum = -(items.length - 1) * stepRef.current;
      syncVisuals(clamp(xRef.current - horizontal * 0.82, minimum, 0), -horizontal / 16);
      if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = window.setTimeout(() => {
        wheelTimerRef.current = null;
        snapTo(Math.round(-xRef.current / stepRef.current));
      }, 120);
    };
    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [items.length, snapTo, syncVisuals]);

  useEffect(() => () => {
    tweenRef.current?.kill();
    if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current);
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || items.length < 2) return;
    tweenRef.current?.kill();
    pointerRef.current = {
      active: true,
      id: event.pointerId,
      startX: event.clientX,
      originX: xRef.current,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = 'true';
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;
    if (!pointer.active || pointer.id !== event.pointerId) return;
    const now = performance.now();
    const delta = event.clientX - pointer.lastX;
    const elapsed = Math.max(8, now - pointer.lastTime);
    pointer.velocity += (delta / elapsed - pointer.velocity) * 0.7;
    const minimum = -(items.length - 1) * stepRef.current;
    const rawX = pointer.originX + event.clientX - pointer.startX;
    const resistedX = rawX > 0 ? rawX * 0.18 : rawX < minimum ? minimum + (rawX - minimum) * 0.18 : rawX;
    syncVisuals(resistedX, pointer.velocity);
    pointer.lastX = event.clientX;
    pointer.lastTime = now;
  };

  const finishPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;
    if (!pointer.active || pointer.id !== event.pointerId) return;
    pointer.active = false;
    event.currentTarget.dataset.dragging = 'false';
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const projectedX = xRef.current + (reducedMotion ? 0 : pointer.velocity * 240);
    snapTo(Math.round(-projectedX / stepRef.current), pointer.velocity);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); snapTo(activeIndexRef.current + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); snapTo(activeIndexRef.current - 1); }
    if (event.key === 'Home') { event.preventDefault(); snapTo(0); }
    if (event.key === 'End') { event.preventDefault(); snapTo(items.length - 1); }
  };

  return (
    <section className="media-gallery" aria-label={label} data-testid="media-gallery" data-reduced-motion={reducedMotion ? 'true' : 'false'}>
      <header>
        <span>Project media</span>
        <span aria-live="polite"><b>{String(activeIndex + 1).padStart(2, '0')}</b> — {String(items.length).padStart(2, '0')}</span>
      </header>
      <div
        ref={viewportRef}
        className="media-gallery-viewport"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${label}. Use arrow keys or drag to browse.`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
      >
        <div ref={trackRef} className="media-gallery-track">
          {items.map((item, index) => (
            <figure className="media-gallery-slide" key={`${item.src}-${index}`} aria-label={`${index + 1} of ${items.length}`} aria-current={index === activeIndex ? 'true' : undefined}>
              <div><img src={item.src} alt={item.alt} draggable={false} /></div>
              <figcaption><span>{item.caption}</span><span>{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
      {items.length > 1 && <nav aria-label="Media controls">
        <button type="button" onClick={() => snapTo(activeIndexRef.current - 1)} disabled={activeIndex === 0} aria-label="Previous media">←</button>
        <button type="button" onClick={() => snapTo(activeIndexRef.current + 1)} disabled={activeIndex === items.length - 1} aria-label="Next media">→</button>
      </nav>}
    </section>
  );
}
