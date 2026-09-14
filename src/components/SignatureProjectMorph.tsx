import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import {
  LinearFilter,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
} from 'three';
import type { Project } from '../data/projects';
import { canUseWebGL } from '../scene/grid/webglSupport';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTextureA;
  uniform sampler2D uTextureB;
  uniform vec2 uResolution;
  uniform float uAspectA;
  uniform float uAspectB;
  uniform float uTransition;
  varying vec2 vUv;

  float random(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    return mix(
      mix(random(cell), random(cell + vec2(1.0, 0.0)), local.x),
      mix(random(cell + vec2(0.0, 1.0)), random(cell + vec2(1.0)), local.x),
      local.y
    );
  }

  float field(vec2 point) {
    float value = noise(point * 3.2) * 0.58;
    value += noise(point * 7.1 + 4.7) * 0.28;
    value += noise(point * 14.3 + 9.2) * 0.14;
    return value;
  }

  vec2 coverUv(vec2 uv, float imageAspect) {
    float viewportAspect = uResolution.x / max(uResolution.y, 1.0);
    if (imageAspect > viewportAspect) {
      uv.x = (uv.x - 0.5) * viewportAspect / imageAspect + 0.5;
    } else {
      uv.y = (uv.y - 0.5) * imageAspect / viewportAspect + 0.5;
    }
    return uv;
  }

  void main() {
    float transition = clamp(uTransition, 0.0, 1.0);
    float textureField = field(vUv + vec2(transition * 0.12, 0.0));
    float reveal = smoothstep(0.36, 0.64, transition + (textureField - 0.5) * 0.48);
    if (transition < 0.001) reveal = 0.0;
    if (transition > 0.999) reveal = 1.0;
    float pulse = sin(transition * 3.14159265);
    vec2 direction = normalize(vec2(0.55, -0.18) + (vUv - 0.5) * 0.34);
    vec2 displacement = direction * (textureField - 0.5) * 0.052 * pulse;
    vec3 colorA = texture2D(uTextureA, coverUv(vUv + displacement, uAspectA)).rgb;
    vec3 colorB = texture2D(uTextureB, coverUv(vUv - displacement, uAspectB)).rgb;
    vec3 color = mix(colorA, colorB, reveal);
    float edge = smoothstep(0.02, 0.0, abs(reveal - 0.5));
    color += edge * pulse * 0.035;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function prepareTexture(texture: Texture): number {
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  const image = texture.image as { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number };
  const width = image.naturalWidth ?? image.width ?? 1;
  const height = image.naturalHeight ?? image.height ?? 1;
  return width / Math.max(height, 1);
}

function MorphPlane({ src, reducedMotion, onTextureError }: { src: string; reducedMotion: boolean; onTextureError: () => void }) {
  const { invalidate, size } = useThree();
  const material = useMemo(() => new ShaderMaterial({
    uniforms: {
      uTextureA: { value: null },
      uTextureB: { value: null },
      uResolution: { value: new Vector2(1, 1) },
      uAspectA: { value: 1 },
      uAspectB: { value: 1 },
      uTransition: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: false,
    depthWrite: false,
  }), []);
  const activeTexture = useRef<Texture | null>(null);
  const incomingTexture = useRef<Texture | null>(null);
  const transitionTween = useRef<gsap.core.Tween | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    material.uniforms.uResolution.value.set(size.width, size.height);
    invalidate();
  }, [invalidate, material, size.height, size.width]);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    const loader = new TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(src, (texture) => {
      if (currentRequest !== requestId.current) {
        texture.dispose();
        return;
      }
      const aspect = prepareTexture(texture);
      transitionTween.current?.kill();
      const current = activeTexture.current;
      const interrupted = incomingTexture.current;
      if (interrupted) {
        const useIncoming = Number(material.uniforms.uTransition.value) >= 0.5;
        if (useIncoming) {
          current?.dispose();
          activeTexture.current = interrupted;
          material.uniforms.uTextureA.value = interrupted;
          material.uniforms.uAspectA.value = material.uniforms.uAspectB.value;
        } else {
          interrupted.dispose();
        }
        incomingTexture.current = null;
      }
      if (!activeTexture.current || reducedMotion) {
        activeTexture.current?.dispose();
        activeTexture.current = texture;
        material.uniforms.uTextureA.value = texture;
        material.uniforms.uTextureB.value = texture;
        material.uniforms.uAspectA.value = aspect;
        material.uniforms.uAspectB.value = aspect;
        material.uniforms.uTransition.value = 0;
        invalidate();
        return;
      }
      incomingTexture.current = texture;
      material.uniforms.uTextureB.value = texture;
      material.uniforms.uAspectB.value = aspect;
      material.uniforms.uTransition.value = 0;
      transitionTween.current = gsap.to(material.uniforms.uTransition, {
        value: 1,
        duration: 0.82,
        ease: 'power2.inOut',
        onUpdate: invalidate,
        onComplete: () => {
          activeTexture.current?.dispose();
          activeTexture.current = texture;
          incomingTexture.current = null;
          transitionTween.current = null;
          material.uniforms.uTextureA.value = texture;
          material.uniforms.uTextureB.value = texture;
          material.uniforms.uAspectA.value = aspect;
          material.uniforms.uAspectB.value = aspect;
          material.uniforms.uTransition.value = 0;
          invalidate();
        },
      });
    }, undefined, () => {
      if (currentRequest === requestId.current) onTextureError();
    });
    return () => { requestId.current += 1; };
  }, [invalidate, material, onTextureError, reducedMotion, src]);

  useEffect(() => () => {
    transitionTween.current?.kill();
    activeTexture.current?.dispose();
    if (incomingTexture.current !== activeTexture.current) incomingTexture.current?.dispose();
    material.dispose();
  }, [material]);

  return <mesh material={material} scale={[size.width, size.height, 1]}><planeGeometry args={[1, 1]} /></mesh>;
}

export function SignatureProjectMorph({ project, reducedMotion, webglEnabled = true }: { project: Project; reducedMotion: boolean; webglEnabled?: boolean }) {
  const [fallback, setFallback] = useState(() => !webglEnabled || !canUseWebGL());
  const handleTextureError = useCallback(() => setFallback(true), []);
  const src = project.media[0];

  return (
    <div className="signature-morph" data-testid="signature-morph" data-project={project.id} data-reduced-motion={reducedMotion ? 'true' : 'false'}>
      {src && <img className="signature-morph-fallback" src={src} alt="" aria-hidden="true" />}
      {!fallback && src && <Canvas
        className="signature-morph-canvas"
        data-testid="signature-morph-canvas"
        frameloop="demand"
        orthographic
        camera={{ position: [0, 0, 2], near: 0.1, far: 10 }}
        dpr={[1, 1.35]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearAlpha(0)}
      >
        <MorphPlane src={src} reducedMotion={reducedMotion} onTextureError={handleTextureError} />
      </Canvas>}
      <div className="signature-morph-shade" aria-hidden="true" />
    </div>
  );
}
