import {
  BoxGeometry, CanvasTexture, DirectionalLight, EdgesGeometry, Group,
  HemisphereLight, LineBasicMaterial, LineSegments, Mesh, MeshPhysicalMaterial,
  PCFShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, Scene,
  ShadowMaterial, SRGBColorSpace, WebGLRenderer,
} from 'three';

// Adapted from the user's emfau-site/components/emfau-cube.tsx:
// physical cube, perspective camera, clearcoat, lights and shadow floor.
export interface BrandCube {
  setActive: (active: boolean) => void;
  dispose: () => void;
}

export function createBrandCube(
  mount: HTMLElement, markUrl: string, active: boolean,
  onReady: () => void, onFailure: () => void,
): BrandCube {
  let disposed = false;
  let enabled = active;
  let refresh = () => {};
  const releases: Array<() => void> = [];
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    releases.reverse().forEach((release) => release());
  };
  try {
    const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    releases.push(() => { renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    renderer.domElement.dataset.testid = 'brand-cube-canvas';
    mount.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.15, 6.2);
    const face = document.createElement('canvas');
    face.width = face.height = 768;
    const context = face.getContext('2d');
    if (!context) throw new Error('Canvas2D unavailable');
    context.fillStyle = '#0b0d12';
    context.fillRect(0, 0, 768, 768);
    const texture = new CanvasTexture(face);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    releases.push(() => texture.dispose());
    const materials = Array.from({ length: 6 }, () => new MeshPhysicalMaterial({
      map: texture, metalness: 0.16, roughness: 0.34,
      clearcoat: 0.7, clearcoatRoughness: 0.22,
    }));
    releases.push(() => materials.forEach((material) => material.dispose()));
    const group = new Group();
    group.rotation.set(-0.34, 0.48, -0.04);
    scene.add(group);
    const cube = new Mesh(new BoxGeometry(2.35, 2.35, 2.35), materials);
    releases.push(() => cube.geometry.dispose());
    cube.castShadow = cube.receiveShadow = true;
    group.add(cube);
    const edges = new LineSegments(new EdgesGeometry(cube.geometry, 20),
      new LineBasicMaterial({ color: 0xf2efe8, transparent: true, opacity: 0.24 }));
    releases.push(() => { edges.geometry.dispose(); edges.material.dispose(); });
    cube.add(edges);
    const floor = new Mesh(new PlaneGeometry(8, 8), new ShadowMaterial({ color: 0x000000, opacity: 0.38 }));
    releases.push(() => { floor.geometry.dispose(); floor.material.dispose(); });
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.72;
    floor.receiveShadow = true;
    scene.add(floor);
    scene.add(new HemisphereLight(0xf2efe8, 0x10131b, 1.4));
    const key = new DirectionalLight(0xffffff, 3.1);
    key.position.set(3.5, 5, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    releases.push(() => key.shadow.dispose());
    scene.add(key);
    const blue = new PointLight(0x7086ff, 18, 9);
    blue.position.set(-3, 0, 2);
    scene.add(blue);
    const orange = new PointLight(0xff4a22, 14, 8);
    orange.position.set(3, -1, 1);
    scene.add(orange);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;
    let lastFrame = 0;
    let previousTime = 0;
    let elapsed = 0;
    let visible = false;
    let hasMark = false;
    let ready = false;
    let frameCount = 0;
    let lost = false;
    const canRender = () => enabled && visible && !document.hidden && !disposed && !lost;
    const render = (now: number) => {
      animationFrame = 0;
      if (!canRender()) { previousTime = 0; return; }
      if (reduced.matches || now - lastFrame >= 1000 / 30) {
        if (previousTime) elapsed += Math.min((now - previousTime) / 1000, 0.1);
        previousTime = now;
        lastFrame = now;
        group.rotation.set(-0.34 + (reduced.matches ? 0 : Math.sin(elapsed * 0.4) * 0.06),
          0.48 + (reduced.matches ? 0 : elapsed * 0.22), -0.04);
        renderer.render(scene, camera);
        if (import.meta.env.DEV) {
          renderer.domElement.dataset.frames = String(++frameCount);
          renderer.domElement.dataset.rotation = String(group.rotation.y);
        }
        if (hasMark && !ready) { ready = true; onReady(); }
      }
      if (!reduced.matches) animationFrame = requestAnimationFrame(render);
    };
    const resume = () => {
      if (!canRender()) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        previousTime = 0;
      } else if (!animationFrame) animationFrame = requestAnimationFrame(render);
    };
    refresh = resume;
    const resize = () => {
      const rect = mount.getBoundingClientRect();
      if (!rect.width || !rect.height || disposed) return;
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      resume();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    releases.push(() => observer.disconnect());
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); });
    intersection.observe(mount);
    releases.push(() => intersection.disconnect());
    const image = new Image();
    image.onload = () => {
      if (disposed) return;
      context.drawImage(image, 84, 152, 600, 464);
      texture.needsUpdate = true;
      hasMark = true;
      resume();
    };
    image.onerror = () => { if (!disposed) onFailure(); };
    releases.push(() => { image.onload = image.onerror = null; });
    const contextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      resume();
      onFailure();
    };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    document.addEventListener('visibilitychange', resume);
    reduced.addEventListener('change', resume);
    releases.push(() => {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener('visibilitychange', resume);
      reduced.removeEventListener('change', resume);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    });
    image.src = markUrl;
    resize();
  } catch { cleanup(); onFailure(); }
  return {
    dispose: cleanup,
    setActive: (nextActive) => { enabled = nextActive; refresh(); },
  };
}
