import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
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

type CasePhase = 'opening' | 'open' | 'preparing-close' | 'closing';

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
  const closeScrollTween = useRef<gsap.core.Tween | null>(null);
  const closeShouldNavigateBack = useRef(true);
  const selectedProjectRef = useRef(selectedProject);
  const casePhaseRef = useRef(casePhase);

  const overlayOpen = Boolean(selectedProject || section !== 'work' || projectBrowserOpen);
  const gridMotionActive = !overlayOpen || casePhase === 'opening' || casePhase === 'closing';
  const statusText = useMemo(() => {
    if (!webglAvailable) return 'Accessible project view';
    if (!rendererReady) return 'Composing selected work';
    if (hoverProject) return `${hoverProject.title} — open project`;
    return matchMedia('(pointer: coarse)').matches ? 'Swipe anywhere' : 'Drag anywhere';
  }, [hoverProject, rendererReady, webglAvailable]);

  useEffect(() => {
    selectedProjectRef.current = selectedProject;
    casePhaseRef.current = casePhase;
  }, [casePhase, selectedProject]);

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
    if (hasCaseStudy(project.id)) {
      gridMotionController.current?.prepareTransition();
      gridMotionController.current?.setTransitionProgress(0);
    }
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
    closeScrollTween.current?.kill();
    closeScrollTween.current = null;
    gridMotionController.current?.resumeAfterTransition();
    setCasePhase(null);
    setSelectedProject(null);
    if (closeShouldNavigateBack.current && projectFromLocation()) window.history.back();
    restoreFocus();
  }, [restoreFocus]);

  const beginCaseClose = useCallback((navigateBack: boolean) => {
    if (!selectedProject || !hasCaseStudy(selectedProject.id) || casePhase !== 'open') return;
    closeShouldNavigateBack.current = navigateBack;
    gridMotionController.current?.prepareTransition();
    gridMotionController.current?.setTransitionProgress(1);
    const caseStudy = document.querySelector<HTMLElement>('.case-study');
    if (!reducedMotion && caseStudy && caseStudy.scrollTop > 4) {
      setCasePhase('preparing-close');
      closeScrollTween.current?.kill();
      closeScrollTween.current = gsap.to(caseStudy, {
        scrollTop: 0,
        duration: Math.min(0.55, Math.max(0.3, caseStudy.scrollTop / 5000)),
        ease: 'power3.inOut',
        onComplete: () => {
          closeScrollTween.current = null;
          setCasePhase('closing');
        },
      });
      return;
    }
    setCasePhase('closing');
  }, [casePhase, reducedMotion, selectedProject]);

  const closeProject = useCallback(() => {
    if (selectedProject && hasCaseStudy(selectedProject.id)) {
      beginCaseClose(true);
      return;
    }
    setSelectedProject(null);
    setCasePhase(null);
    if (projectFromLocation()) window.history.back();
    restoreFocus();
  }, [beginCaseClose, restoreFocus, selectedProject]);

  useEffect(() => {
    const onPopState = () => {
      const project = projectFromLocation();
      if (!project && selectedProjectRef.current && hasCaseStudy(selectedProjectRef.current.id)) {
        beginCaseClose(false);
        return;
      }
      if (project) {
        selectProject(project, defaultOrigin(), false);
        return;
      }
      gridMotionController.current?.resumeAfterTransition();
      setSelectedProject(null);
      setCasePhase(null);
      restoreFocus();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [beginCaseClose, restoreFocus, selectProject]);

  useEffect(() => () => {
    closeScrollTween.current?.kill();
  }, []);

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
    const currentProject = selectedProjectRef.current;
    if (controller && currentProject && hasCaseStudy(currentProject.id)) {
      controller.prepareTransition();
      controller.setTransitionProgress(casePhaseRef.current === 'opening' ? 0 : 1);
    }
  }, []);
  const handleMorphProgress = useCallback((progress: number) => {
    gridMotionController.current?.setTransitionProgress(progress);
  }, []);
  const finishOpen = useCallback(() => {
    gridMotionController.current?.setTransitionProgress(1);
    setCasePhase('open');
  }, []);
  const ignoreClose = useCallback(() => undefined, []);

  return (
    <div className={`app ${overlayOpen ? 'has-overlay' : ''}`}>
      <div className="ambient" aria-hidden="true" /><div className="edge" aria-hidden="true" /><div className="grain" aria-hidden="true" />
      <div className="watermark" aria-hidden="true"><span>EMFAU</span><span>SPATIAL INDEX</span></div>

      <div className="scene" aria-hidden={overlayOpen}>
        {webglAvailable ? <GridScene active={gridMotionActive} filter={filter} reducedMotion={reducedMotion} onSelect={handleTileSelect}
          onActiveIndex={setActiveIndex} onHoverProject={setHoverProject} onInteraction={handleInteraction}
          onReady={handleRendererReady} onContextLost={handleContextLost} onMotionController={handleMotionController} />
          : <FallbackGrid filter={filter} onSelect={(project) => selectProject(project)} />}
      </div>

      <Chrome activeIndex={activeIndex} filter={filter} filterOpen={filterOpen} hidden={Boolean(selectedProject)} section={section}
        onFilterChange={changeFilter} onFilterToggle={() => setFilterOpen((open) => !open)} onSectionChange={changeSection}
        onBrowseProjects={() => { focusBeforeOverlay.current = document.activeElement as HTMLElement; setProjectBrowserOpen(true); }} />
      <div className={`interaction-hint ${overlayOpen ? 'is-hidden' : ''}`} aria-live="polite"><i />{statusText}</div>

      {section !== 'work' && !selectedProject && <SectionSheet section={section} onClose={() => { setSection('work'); restoreFocus(); }} />}
      {projectBrowserOpen && !selectedProject && <ProjectBrowser filter={filter} reducedMotion={reducedMotion} webglEnabled={webglAvailable} onClose={() => { setProjectBrowserOpen(false); restoreFocus(); }} onFilterChange={changeFilter} onSelect={(project) => selectProject(project)} />}
      {selectedProject && !hasCaseStudy(selectedProject.id) && <ProjectDetail project={selectedProject} onClose={closeProject} />}

      {selectedProject && hasCaseStudy(selectedProject.id) && casePhase === 'opening' && <CaseMorph origin={origin} image={selectedProject.media[0]} opening reducedMotion={reducedMotion} onProgress={handleMorphProgress} onComplete={finishOpen} />}
      {selectedProject && hasCaseStudy(selectedProject.id) && (casePhase === 'open' || casePhase === 'preparing-close') && <PremiumCaseStudy project={selectedProject} onClose={closeProject} reducedMotion={reducedMotion} />}
      {selectedProject && hasCaseStudy(selectedProject.id) && casePhase === 'closing' && <><PremiumCaseStudy project={selectedProject} onClose={ignoreClose} reducedMotion={reducedMotion} motionEnabled={false} /><CaseMorph origin={origin} image={selectedProject.media[0]} opening={false} reducedMotion={reducedMotion} onProgress={handleMorphProgress} onComplete={finishClose} /></>}
    </div>
  );
}
