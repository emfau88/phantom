import type { Project, ProjectFilter } from '../data/projects';
import { projectsForFilter } from '../data/projects';

export function FallbackGrid({ filter, onSelect }: { filter: ProjectFilter; onSelect: (project: Project) => void }) {
  return <main className="fallback-grid" data-testid="webgl-fallback"><p>Your browser is showing the accessible portfolio view.</p><div>{projectsForFilter(filter).map((project) => <button key={project.id} type="button" onClick={() => onSelect(project)}>{project.media[0] && <img src={project.media[0]} alt="" loading="lazy" />}<span>{project.title}</span><small>{project.category} / {project.year}</small></button>)}</div></main>;
}
