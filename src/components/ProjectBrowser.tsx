import { useEffect, useRef } from 'react';
import type { Project, ProjectFilter } from '../data/projects';
import { filterLabels, projectsForFilter } from '../data/projects';

interface Props { filter: ProjectFilter; onClose: () => void; onFilterChange: (filter: ProjectFilter) => void; onSelect: (project: Project) => void }

export function ProjectBrowser({ filter, onClose, onFilterChange, onSelect }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);
  return (
    <section className="project-browser" role="dialog" aria-modal="true" aria-labelledby="project-browser-title">
      <header><div><span>Accessible project index</span><h2 id="project-browser-title">Selected work</h2></div><button ref={closeRef} type="button" onClick={onClose}>Close ×</button></header>
      <div className="browser-filters" role="group" aria-label="Filter project index">
        {(['ALL', 'GAME', 'APP', 'WEB'] as ProjectFilter[]).map((item) => (
          <button key={item} type="button" aria-pressed={filter === item} onClick={() => onFilterChange(item)}>{filterLabels[item]}</button>
        ))}
      </div>
      <ol>{projectsForFilter(filter).map((project) => <li key={project.id}><button type="button" onClick={() => onSelect(project)}><span>{project.title}</span><small>{project.category} / {project.year}</small></button></li>)}</ol>
    </section>
  );
}
