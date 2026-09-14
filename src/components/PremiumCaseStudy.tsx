import { useEffect, useRef, type CSSProperties } from 'react';
import type { Project } from '../data/projects';
import { projects } from '../data/projects';
import { caseStudies, hasCaseStudy, type CaseStudyContent } from '../data/caseStudies';
import { useCaseStudyMotion } from '../hooks/useCaseStudyMotion';
import { MediaGallery } from './MediaGallery';

function MaskedWords({ text }: { text: string }) {
  return text.split(/\s+/).map((word, index) => (
    <span className="case-word-mask" aria-hidden="true" key={`${word}-${index}`}>
      <span className="case-word" data-case-word>{word}</span>
    </span>
  ));
}

export function PremiumCaseStudy({
  project,
  onClose,
  reducedMotion,
  motionEnabled = true,
}: {
  project: Project;
  onClose: () => void;
  reducedMotion: boolean;
  motionEnabled?: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const caseStudyRef = useRef<HTMLElement>(null);
  const animate = motionEnabled && !reducedMotion;
  useCaseStudyMotion(caseStudyRef, animate);
  useEffect(() => closeRef.current?.focus(), []);
  if (!hasCaseStudy(project.id)) return null;

  const content: CaseStudyContent = caseStudies[project.id];
  const index = String(projects.indexOf(project) + 1).padStart(2, '0');
  const hero = project.media[0];
  const galleryItems = project.media.map((src, mediaIndex) => ({
    src,
    alt: content.mediaAlts[mediaIndex] ?? `${project.title} project view ${mediaIndex + 1}`,
    caption: content.mediaCaptions[mediaIndex] ?? `${project.title} / project view`,
  }));
  const primaryAction = project.liveUrl ?? project.repositoryUrl;
  const primaryLabel = project.liveUrl
    ? project.category === 'APP' ? 'Open on Google Play ↗' : 'Play current build ↗'
    : 'Explore the repository ↗';
  const style = { '--case-accent': content.accent } as CSSProperties;

  return (
    <article
      ref={caseStudyRef}
      className={`case-study case-theme-${project.art} case-category-${project.category.toLowerCase()}`}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${project.id}-title`}
      data-testid={`case-study-${project.id}`}
      data-motion={animate ? 'active' : reducedMotion ? 'reduced' : 'idle'}
    >
      <section className="case-hero">
        {hero ? <img src={hero} alt={content.mediaAlts[0]} style={{ objectPosition: content.imagePosition, objectFit: content.imageFit }} /> : <div className="case-hero-fallback" />}
        <div className="case-topbar">
          <span><b>EMFAU</b> / Selected work / {index}</span>
          <button ref={closeRef} type="button" onClick={onClose}>Close ×</button>
        </div>
        <div className="case-hero-copy">
          <div><div className="case-kicker">{content.eyebrow}</div><h1 id={`${project.id}-title`} aria-label={project.title}><MaskedWords text={project.title} /></h1></div>
          <p>{content.statement}</p>
        </div>
      </section>

      <main>
        <section className="case-intro">
          <div><p className="case-lead" aria-label={content.lead} data-case-scroll-reveal><MaskedWords text={content.lead} /></p><p className="case-copy">{content.overview}</p></div>
          <div className="case-facts">{content.facts.map(([label, value]) => <div className="case-fact" key={label}><span>{label}</span><b>{value}</b></div>)}</div>
        </section>

        <section className="case-pillars" aria-label={`${project.title} design highlights`}>
          {content.pillars.map((pillar) => <article key={pillar.label}><span>{pillar.label}</span><h2 aria-label={pillar.title} data-case-scroll-reveal><MaskedWords text={pillar.title} /></h2><p>{pillar.body}</p></article>)}
        </section>

        <MediaGallery items={galleryItems} label={`${project.title} media gallery`} reducedMotion={reducedMotion || !motionEnabled} />

        <section className="case-statement"><div>Design / system</div><div><h2 aria-label={content.designTitle} data-case-scroll-reveal><MaskedWords text={content.designTitle} /></h2><p>{content.designBody}</p></div></section>

        <footer className="case-footer">
          <h2 aria-label={`${content.closing} ${content.closingAccent}`} data-case-scroll-reveal><span className="case-heading-line"><MaskedWords text={content.closing} /></span><span className="case-heading-line case-footer-accent"><MaskedWords text={content.closingAccent} /></span></h2>
          <div>
            {primaryAction && <a className="primary" href={primaryAction} target="_blank" rel="noopener noreferrer">{primaryLabel}</a>}
            {project.liveUrl && project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
            <button type="button" onClick={onClose}>Back to grid</button>
          </div>
        </footer>
      </main>
    </article>
  );
}
