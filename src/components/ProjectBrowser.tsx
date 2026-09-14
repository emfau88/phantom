import { useEffect, useRef, useState } from 'react';
import type { Project, ProjectFilter } from '../data/projects';
import { filterLabels, projectsForFilter } from '../data/projects';
import { SignatureProjectMorph } from './SignatureProjectMorph';

interface Props { filter: ProjectFilter; reducedMotion: boolean; webglEnabled: boolean; onClose: () => void; onFilterChange: (filter: ProjectFilter) => void; onSelect: (project: Project) => void }

export function ProjectBrowser({ filter, reducedMotion, webglEnabled, onClose, onFilterChange, onSelect }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [previewProject, setPreviewProject] = useState(() => projectsForFilter(filter)[0]);
  useEffect(() => closeRef.current?.focus(), []);
  const filteredProjects = projectsForFilter(filter);
  const changeFilter = (nextFilter: ProjectFilter) => {
    setPreviewProject(projectsForFilter(nextFilter)[0]);
    onFilterChange(nextFilter);
  };
  return (
    <section className="project-browser" role="dialog" aria-modal="true" aria-labelledby="project-browser-title">
      <header><div><span>Accessible project index</span><h2 id="project-browser-title">Selected work</h2></div><button ref={closeRef} type="button" onClick={onClose}>Close ×</button></header>
      <div className="browser-filters" role="group" aria-label="Filter project index">
        {(['ALL', 'GAME', 'APP', 'WEB'] as ProjectFilter[]).map((item) => (
          <button key={item} type="button" aria-pressed={filter === item} onClick={() => changeFilter(item)}>{filterLabels[item]}</button>
        ))}
      </div>
      <div className="project-browser-layout">
        {previewProject && <aside className="project-browser-preview" aria-live="polite">
          <SignatureProjectMorph project={previewProject} reducedMotion={reducedMotion} webglEnabled={webglEnabled} />
          <div><span>{previewProject.category} / {previewProject.year}</span><b>{previewProject.title}</b><small>{previewProject.tags.slice(0, 3).join(' / ')}</small></div>
        </aside>}
        <ol>{filteredProjects.map((project) => <li key={project.id}><button type="button" onPointerMove={() => setPreviewProject(project)} onFocus={() => setPreviewProject(project)} onClick={() => onSelect(project)}><span>{project.title}</span><small>{project.category} / {project.year}</small></button></li>)}</ol>
      </div>
    </section>
  );
}
