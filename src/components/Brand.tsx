import { useEffect, useRef, useState } from 'react';
import { createBrandCube, type BrandCube } from '../scene/brand/createBrandCube';

const markUrl = `${import.meta.env.BASE_URL}brand/emfau-mark.svg`;

export function Brand({ active = true }: { active?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<BrandCube | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const cube = createBrandCube(mount, markUrl, true, () => setReady(true), () => setFailed(true));
    cubeRef.current = cube;
    return () => { cube.dispose(); cubeRef.current = null; };
  }, []);
  useEffect(() => { cubeRef.current?.setActive(active); }, [active]);
  return (
    <div className="brand-lockup" aria-label="EMFAU, independent creative developer">
      <div className="brand-cube" data-testid="brand-cube" data-ready={ready && !failed} aria-hidden="true">
        <img className="brand-cube-fallback" src={markUrl} alt="" />
        <div className="brand-cube-mount" ref={mountRef} />
      </div>
    </div>
  );
}
