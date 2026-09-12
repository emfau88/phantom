import { useEffect, useRef } from 'react';
import type { Project } from '../data/projects';

export function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);
  return (
    <div className="detail-layer" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <article className="project-detail" role="dialog" aria-modal="true" aria-labelledby="project-detail-title">
        <div className="detail-visual">{project.media[0] ? <img src={project.media[0]} alt="" /> : <div className="detail-fallback" />}</div>
        <div className="detail-body"><div><span className="eyebrow">{project.kicker ?? `${project.category} / ${project.year}`}</span><h2 id="project-detail-title">{project.title}</h2><p>{project.description}</p><div className="detail-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="detail-actions">{project.liveUrl && <a className="primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live project ↗</a>}{project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}</div></div><footer><span>{project.category} / {project.year}</span><button ref={closeRef} type="button" onClick={onClose} aria-label="Close project">×</button></footer></div>
      </article>
    </div>
  );
}
