import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector2 } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { distortionConfig } from '../grid/distortion';
import type { GridMotionState } from '../grid/motionState';

interface Props {
  motionState: GridMotionState;
}

const distortionShader = {
  uniforms: {
    tDiffuse: { value: null },
    uResolution: { value: new Vector2(1, 1) },
    uDragZoom: { value: 0 },
    uDistortion: { value: distortionConfig.radial },
    uVignette: { value: distortionConfig.vignette },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uDragZoom;
    uniform float uDistortion;
    uniform float uVignette;
    varying vec2 vUv;

    void main() {
      vec2 p = 2.0 * (vUv - 0.5);
      vec2 metric = p * vec2(0.78, 1.0);
      float radiusSquared = dot(metric, metric);
      float dragScale = 1.0 + uDragZoom * 0.01;
      p.x *= (0.885 + uDistortion * radiusSquared) * dragScale;
      p.y *= (0.885 + uDistortion * 0.86 * radiusSquared) * dragScale;
      vec2 sampleUv = p * 0.5 + 0.5;

      vec3 color = texture2D(tDiffuse, sampleUv).rgb;
      float distanceToCenter = length((vUv - 0.5) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0));
      float vignette = smoothstep(0.82, 0.2, distanceToCenter);
      color *= mix(1.0 - uVignette, 1.0, vignette);

      float inside = step(0.0, sampleUv.x) * step(sampleUv.x, 1.0)
        * step(0.0, sampleUv.y) * step(sampleUv.y, 1.0);
      gl_FragColor = vec4(color * inside, 1.0);
    }
  `,
};

export function PortfolioPostProcessing({ motionState }: Props) {
  const { gl, scene, camera, size } = useThree();
  const { composer, pass } = useMemo(() => {
    const nextComposer = new EffectComposer(gl);
    nextComposer.addPass(new RenderPass(scene, camera));
    const nextPass = new ShaderPass(distortionShader);
    nextComposer.addPass(nextPass);
    nextComposer.addPass(new OutputPass());
    return { composer: nextComposer, pass: nextPass };
  }, [camera, gl, scene]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
    pass.uniforms.uResolution.value.set(size.width, size.height);
  }, [composer, pass, size.height, size.width]);

  useEffect(() => () => composer.dispose(), [composer]);

  useFrame(() => {
    // Shader uniforms are intentionally mutable render-loop state.
    // eslint-disable-next-line react-hooks/immutability
    pass.uniforms.uDragZoom.value = motionState.dragProgress.value;
    composer.render();
  }, 1);

  return null;
}
