import { useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Color } from 'three';
import type { Project, ProjectFilter } from '../data/projects';
import { projects } from '../data/projects';
import { GridController, type GridCallbacks, type TileSelection } from './grid/GridController';
import { PortfolioPostProcessing } from './postprocessing/PortfolioPostProcessing';

interface GridSceneProps {
  filter: ProjectFilter;
  reducedMotion: boolean;
  onSelect: (selection: TileSelection) => void;
  onActiveIndex: (index: number) => void;
  onHoverProject: (project: Project | null) => void;
  onInteraction: () => void;
  onReady?: () => void;
  onContextLost?: () => void;
}

type GridPrimitiveProps = GridSceneProps;

declare global {
  interface Window {
    __EMFAU_GRID__?: {
      state: () => Record<string, number | boolean>;
    };
  }
}

function GridPrimitive({
  filter,
  reducedMotion,
  onSelect,
  onActiveIndex,
  onHoverProject,
  onInteraction,
  onReady,
  onContextLost,
}: GridPrimitiveProps) {
  const { gl, size } = useThree();
  const callbacks = useMemo<GridCallbacks>(() => ({
    onSelect,
    onActiveIndex,
    onHoverProject,
    onInteraction,
  }), [onActiveIndex, onHoverProject, onInteraction, onSelect]);
  const controller = useMemo(() => new GridController(projects, callbacks), [callbacks]);

  useEffect(() => {
    controller.connect(gl.domElement);
    onReady?.();
    return () => controller.dispose();
  }, [controller, gl.domElement, onReady]);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onContextLost?.();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    return () => canvas.removeEventListener('webglcontextlost', handleContextLost);
  }, [gl.domElement, onContextLost]);

  useEffect(() => {
    controller.resize(size.width, size.height);
  }, [controller, size.height, size.width]);

  useEffect(() => {
    controller.setFilter(filter);
  }, [controller, filter]);

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__EMFAU_GRID__ = { state: () => controller.getDebugState() };
    return () => {
      delete window.__EMFAU_GRID__;
    };
  }, [controller]);

  useFrame((_, delta) => controller.update(delta, reducedMotion), 0);

  return (
    <>
      <primitive object={controller} />
      <PortfolioPostProcessing dragZoom={controller.dragZoom} />
    </>
  );
}

export function GridScene(props: GridSceneProps) {
  return (
    <Canvas
      className="grid-canvas"
      data-testid="grid-canvas"
      orthographic
      camera={{ position: [0, 0, 10], near: 0.1, far: 100, zoom: 1 }}
      dpr={[1, 1.55]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new Color('#000000'), 1);
        scene.background = new Color('#000000');
      }}
    >
      <GridPrimitive {...props} />
    </Canvas>
  );
}
