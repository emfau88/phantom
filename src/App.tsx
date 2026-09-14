import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Project, ProjectFilter } from './data/projects';
import { projectById } from './data/projects';
import { Chrome, type Section } from './components/Chrome';
import { SectionSheet } from './components/SectionSheet';
import { ProjectBrowser } from './components/ProjectBrowser';
import { ProjectDetail } from './components/ProjectDetail';
import { FallbackGrid } from './components/FallbackGrid';
import { PremiumCaseStudy } from './components/PremiumCaseStudy';
import { CaseMorph } from './components/CaseMorph';
import { hasCaseStudy } from './data/caseStudies';
import { GridScene } from './scene/GridScene';
import { canUseWebGL } from './scene/grid/webglSupport';
import type { TileSelection } from './scene/grid/GridController';
import type { ScreenRect } from './scene/grid/distortion';
import type { GridMotionController } from './scene/grid/motionState';
import { useReducedMotion } from './hooks/useReducedMotion';

type CasePhase = 'opening' | 'open' | 'closing';

const defaultOrigin = (): ScreenRect => ({
  left: window.innerWidth * 0.42,
  top: window.innerHeight * 0.4,
  width: window.innerWidth * 0.16,
  height: window.innerHeight * 0.18,
});

function projectFromLocation(): Project | null {
  const match = window.location.hash.match(/^#project\/([a-z0-9-]+)$/);
  return match ? projectById.get(match[1]) ?? null : null;
}

export function App() {
  const reducedMotion = useReducedMotion();
  const forceFallback = new URLSearchParams(window.location.search).has('fallback');
  const [webglAvailable, setWebglAvailable] = useState(() => !forceFallback && canUseWebGL());
  const [rendererReady, setRendererReady] = useState(false);
  const [filter, setFilter] = useState<ProjectFilter>('ALL');
  const [filterOpen, setFilterOpen] = useState(false);
  const [section, setSection] = useState<Section>('work');
  const [projectBrowserOpen, setProjectBrowserOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(() => projectFromLocation());
  const [casePhase, setCasePhase] = useState<CasePhase | null>(() => {
    const project = projectFromLocation();
    return project && hasCaseStudy(project.id) ? 'opening' : null;
  });
  const [origin, setOrigin] = useState<ScreenRect>(defaultOrigin);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverProject, setHoverProject] = useState<Project | null>(null);
  const focusBeforeOverlay = useRef<HTMLElement | null>(null);
  const gridMotionController = useRef<GridMotionController | null>(null);

  const overlayOpen = Boolean(selectedProject || section !== 'work' || projectBrowserOpen);
  const statusText = useMemo(() => {
    if (!webglAvailable) return 'Accessible project view';
    if (!rendererReady) return 'Composing selected work';
    if (hoverProject) return `${hoverProject.title} — open project`;
    return matchMedia('(pointer: coarse)').matches ? 'Swipe anywhere' : 'Drag anywhere';
  }, [hoverProject, rendererReady, webglAvailable]);

  const restoreFocus = useCallback(() => {
    window.setTimeout(() => focusBeforeOverlay.current?.focus(), 0);
  }, []);

  const updateLocation = useCallback((project: Project | null, mode: 'push' | 'replace' = 'push') => {
    const url = new URL(window.location.href);
    url.hash = project ? `project/${project.id}` : '';
    window.history[mode === 'push' ? 'pushState' : 'replaceState']({ project: project?.id ?? null }, '', url);
  }, []);

  const selectProject = useCallback((project: Project, selectionOrigin = defaultOrigin(), push = true) => {
    focusBeforeOverlay.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSection('work');
    setFilterOpen(false);
    setProjectBrowserOpen(false);
    setOrigin(selectionOrigin);
    setSelectedProject(project);
    setCasePhase(hasCaseStudy(project.id) ? 'opening' : null);
    if (push) updateLocation(project);
  }, [updateLocation]);

  const handleTileSelect = useCallback((selection: TileSelection) => {
    selectProject(selection.project, selection.origin);
  }, [selectProject]);

  const finishClose = useCallback(() => {
    setCasePhase(null);
    setSelectedProject(null);
    if (projectFromLocation()) window.history.back();
    restoreFocus();
  }, [restoreFocus]);

  const closeProject = useCallback(() => {
    if (selectedProject && hasCaseStudy(selectedProject.id) && casePhase !== 'closing') {
      setCasePhase('closing');
      return;
    }
    setSelectedProject(null);
    setCasePhase(null);
    if (projectFromLocation()) window.history.back();
    restoreFocus();
  }, [casePhase, restoreFocus, selectedProject]);

  useEffect(() => {
    const onPopState = () => {
      const project = projectFromLocation();
      setSelectedProject(project);
      setOrigin(defaultOrigin());
      setCasePhase(project && hasCaseStudy(project.id) ? 'opening' : null);
      if (!project) restoreFocus();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [restoreFocus]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (filterOpen) setFilterOpen(false);
      else if (projectBrowserOpen) { setProjectBrowserOpen(false); restoreFocus(); }
      else if (selectedProject) closeProject();
      else if (section !== 'work') { setSection('work'); restoreFocus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeProject, filterOpen, projectBrowserOpen, restoreFocus, section, selectedProject]);

  const changeFilter = useCallback((next: ProjectFilter) => {
    setFilter(next);
    setFilterOpen(false);
    setActiveIndex(0);
  }, []);

  const changeSection = useCallback((next: Section) => {
    focusBeforeOverlay.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSection(next);
    setFilterOpen(false);
  }, []);
  const handleInteraction = useCallback(() => undefined, []);
  const handleRendererReady = useCallback(() => setRendererReady(true), []);
  const handleContextLost = useCallback(() => {
    setRendererReady(false);
    setWebglAvailable(false);
  }, []);
  const handleMotionController = useCallback((controller: GridMotionController | null) => {
    gridMotionController.current = controller;
  }, []);
  const finishOpen = useCallback(() => setCasePhase('open'), []);
  const ignoreClose = useCallback(() => undefined, []);

  return (
    <div className={`app ${overlayOpen ? 'has-overlay' : ''}`}>
      <div className="ambient" aria-hidden="true" /><div className="edge" aria-hidden="true" /><div className="grain" aria-hidden="true" />
      <div className="watermark" aria-hidden="true"><span>EMFAU</span><span>SPATIAL INDEX</span></div>

      <div className="scene" aria-hidden={overlayOpen}>
        {webglAvailable ? <GridScene filter={filter} reducedMotion={reducedMotion} onSelect={handleTileSelect}
          onActiveIndex={setActiveIndex} onHoverProject={setHoverProject} onInteraction={handleInteraction}
          onReady={handleRendererReady} onContextLost={handleContextLost} onMotionController={handleMotionController} />
          : <FallbackGrid filter={filter} onSelect={(project) => selectProject(project)} />}
      </div>

      <Chrome activeIndex={activeIndex} filter={filter} filterOpen={filterOpen} hidden={Boolean(selectedProject)} section={section}
        onFilterChange={changeFilter} onFilterToggle={() => setFilterOpen((open) => !open)} onSectionChange={changeSection}
        onBrowseProjects={() => { focusBeforeOverlay.current = document.activeElement as HTMLElement; setProjectBrowserOpen(true); }} />
      <div className={`interaction-hint ${overlayOpen ? 'is-hidden' : ''}`} aria-live="polite"><i />{statusText}</div>

      {section !== 'work' && !selectedProject && <SectionSheet section={section} onClose={() => { setSection('work'); restoreFocus(); }} />}
      {projectBrowserOpen && !selectedProject && <ProjectBrowser filter={filter} onClose={() => { setProjectBrowserOpen(false); restoreFocus(); }} onFilterChange={changeFilter} onSelect={(project) => selectProject(project)} />}
      {selectedProject && !hasCaseStudy(selectedProject.id) && <ProjectDetail project={selectedProject} onClose={closeProject} />}

      {selectedProject && hasCaseStudy(selectedProject.id) && casePhase === 'opening' && <CaseMorph origin={origin} image={selectedProject.media[0]} opening reducedMotion={reducedMotion} onComplete={finishOpen} />}
      {selectedProject && hasCaseStudy(selectedProject.id) && casePhase === 'open' && <PremiumCaseStudy project={selectedProject} onClose={closeProject} reducedMotion={reducedMotion} />}
      {selectedProject && hasCaseStudy(selectedProject.id) && casePhase === 'closing' && <><PremiumCaseStudy project={selectedProject} onClose={ignoreClose} reducedMotion={reducedMotion} motionEnabled={false} /><CaseMorph origin={origin} image={selectedProject.media[0]} opening={false} reducedMotion={reducedMotion} onComplete={finishClose} /></>}
    </div>
  );
}
