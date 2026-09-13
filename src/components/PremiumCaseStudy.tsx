import { useEffect, useRef, type CSSProperties } from 'react';
import type { Project } from '../data/projects';
import { projects } from '../data/projects';
import { caseStudies, hasCaseStudy, type CaseStudyContent } from '../data/caseStudies';

export function PremiumCaseStudy({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);
  if (!hasCaseStudy(project.id)) return null;

  const content: CaseStudyContent = caseStudies[project.id];
  const index = String(projects.indexOf(project) + 1).padStart(2, '0');
  const hero = project.media[0];
  const secondary = project.media.slice(1, 3);
  const primaryAction = project.liveUrl ?? project.repositoryUrl;
  const primaryLabel = project.liveUrl
    ? project.category === 'APP' ? 'Open on Google Play ↗' : 'Play current build ↗'
    : 'Explore the repository ↗';
  const style = { '--case-accent': content.accent } as CSSProperties;

  return (
    <article
      className={`case-study case-theme-${project.art} case-category-${project.category.toLowerCase()}`}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${project.id}-title`}
      data-testid={`case-study-${project.id}`}
    >
      <section className="case-hero">
        {hero ? <img src={hero} alt={content.mediaAlts[0]} style={{ objectPosition: content.imagePosition, objectFit: content.imageFit }} /> : <div className="case-hero-fallback" />}
        <div className="case-topbar">
          <span><b>EMFAU</b> / Selected work / {index}</span>
          <button ref={closeRef} type="button" onClick={onClose}>Close ×</button>
        </div>
        <div className="case-hero-copy">
          <div><div className="case-kicker">{content.eyebrow}</div><h1 id={`${project.id}-title`}>{project.title}</h1></div>
          <p>{content.statement}</p>
        </div>
      </section>

      <main>
        <section className="case-intro">
          <div><p className="case-lead">{content.lead}</p><p className="case-copy">{content.overview}</p></div>
          <div className="case-facts">{content.facts.map(([label, value]) => <div className="case-fact" key={label}><span>{label}</span><b>{value}</b></div>)}</div>
        </section>

        <section className="case-pillars" aria-label={`${project.title} design highlights`}>
          {content.pillars.map((pillar) => <article key={pillar.label}><span>{pillar.label}</span><h2>{pillar.title}</h2><p>{pillar.body}</p></article>)}
        </section>

        {secondary[0] && <section className="case-media"><figure><img src={secondary[0]} alt={content.mediaAlts[1] ?? `${project.title} project view`} /><figcaption><span>{content.mediaCaptions[1] ?? 'Project view'}</span><span>{project.title} / {project.year}</span></figcaption></figure></section>}
        {secondary[1] && hero && <section className="case-duo"><figure><img src={hero} alt={content.mediaAlts[0]} /><figcaption>{content.mediaCaptions[0]}</figcaption></figure><figure><img src={secondary[1]} alt={content.mediaAlts[2] ?? `${project.title} detail`} /><figcaption>{content.mediaCaptions[2] ?? 'Project detail'}</figcaption></figure></section>}

        <section className="case-statement"><div>Design / system</div><div><h2>{content.designTitle}</h2><p>{content.designBody}</p></div></section>

        <footer className="case-footer">
          <h2>{content.closing}<br /><span>{content.closingAccent}</span></h2>
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
