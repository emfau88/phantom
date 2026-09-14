import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useCaseStudyMotion(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    root.dataset.motionReady = 'true';

    const context = gsap.context(() => {
      const hero = root.querySelector<HTMLElement>('.case-hero');
      const heroImage = hero?.querySelector<HTMLElement>(':scope > img');
      const heroCopy = hero?.querySelector<HTMLElement>('.case-hero-copy');
      const heroWords = hero?.querySelectorAll<HTMLElement>('[data-case-word]') ?? [];
      const heroMeta = hero?.querySelectorAll<HTMLElement>('.case-kicker, .case-hero-copy > p') ?? [];

      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (heroImage) {
        entrance.fromTo(heroImage, { scale: 1.045 }, { scale: 1, duration: 1.15 }, 0);
      }
      if (heroWords.length) {
        entrance.fromTo(
          heroWords,
          { yPercent: 112 },
          { yPercent: 0, duration: 0.84, stagger: 0.035 },
          0.06,
        );
      }
      if (heroMeta.length) {
        entrance.fromTo(
          heroMeta,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.68, stagger: 0.08 },
          0.24,
        );
      }

      if (hero && heroImage) {
        gsap.to(heroImage, {
          yPercent: 7,
          scale: 1.025,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            scroller: root,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.7,
          },
        });
      }
      if (hero && heroCopy) {
        gsap.to(heroCopy, {
          yPercent: -6,
          autoAlpha: 0.72,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            scroller: root,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.7,
          },
        });
      }

      root.querySelectorAll<HTMLElement>('[data-case-scroll-reveal]').forEach((section) => {
        const words = section.querySelectorAll<HTMLElement>('[data-case-word]');
        if (!words.length) return;
        gsap.fromTo(
          words,
          { yPercent: 112 },
          {
            yPercent: 0,
            duration: 0.78,
            stagger: 0.025,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              scroller: root,
              start: 'top 84%',
              once: true,
            },
          },
        );
      });

      const facts = root.querySelectorAll<HTMLElement>('.case-fact');
      if (facts.length) {
        gsap.fromTo(
          facts,
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.58,
            stagger: 0.055,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: root.querySelector('.case-facts'),
              scroller: root,
              start: 'top 86%',
              once: true,
            },
          },
        );
      }

      root.querySelectorAll<HTMLElement>('.case-pillars > article').forEach((pillar) => {
        const label = pillar.querySelector<HTMLElement>(':scope > span');
        if (!label) return;
        gsap.fromTo(
          label,
          { autoAlpha: 0, y: 10 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: pillar,
              scroller: root,
              start: 'top 84%',
              once: true,
            },
          },
        );
      });

      root.querySelectorAll<HTMLElement>('.case-media figure, .case-duo figure').forEach((figure) => {
        gsap.fromTo(
          figure,
          { autoAlpha: 0.35, y: 30, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: figure,
              scroller: root,
              start: 'top 88%',
              once: true,
            },
          },
        );
        const image = figure.querySelector<HTMLElement>('img');
        if (!image) return;
        gsap.fromTo(
          image,
          { scale: 1.035 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: figure,
              scroller: root,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          },
        );
      });
    }, root);

    const images = Array.from(root.querySelectorAll('img'));
    const refresh = () => ScrollTrigger.refresh();
    for (const image of images) {
      if (!image.complete) image.addEventListener('load', refresh);
    }
    const refreshFrame = requestAnimationFrame(refresh);

    return () => {
      cancelAnimationFrame(refreshFrame);
      for (const image of images) image.removeEventListener('load', refresh);
      context.revert();
      delete root.dataset.motionReady;
    };
  }, [enabled, rootRef]);
}
