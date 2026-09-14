export interface ScreenPoint {
  x: number;
  y: number;
}

export interface ScreenRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const distortionConfig = {
  baseScale: 0.885,
  radial: -0.145,
  horizontalMetric: 0.78,
  verticalMultiplier: 0.86,
  vignette: 0.34,
  dragScaleGain: 0.032,
  dragDistortionRelaxation: 0.1,
} as const;

export function distortionMotion(dragProgress = 0): { dragScale: number; radial: number } {
  const drag = Math.min(1, Math.max(0, dragProgress));
  return {
    dragScale: 1 + drag * distortionConfig.dragScaleGain,
    radial: distortionConfig.radial * (1 - drag * distortionConfig.dragDistortionRelaxation),
  };
}

export function screenToSource(
  px: number,
  py: number,
  width: number,
  height: number,
  dragZoom = 0,
): ScreenPoint {
  let x = 2 * (px / Math.max(width, 1) - 0.5);
  let y = 2 * ((1 - py / Math.max(height, 1)) - 0.5);
  const metricX = x * distortionConfig.horizontalMetric;
  const radiusSquared = metricX * metricX + y * y;
  const { dragScale, radial } = distortionMotion(dragZoom);

  x *= (distortionConfig.baseScale + radial * radiusSquared) * dragScale;
  y *= (
    distortionConfig.baseScale
    + radial * distortionConfig.verticalMultiplier * radiusSquared
  ) * dragScale;

  return {
    x: (x * 0.5 + 0.5) * width,
    y: (1 - (y * 0.5 + 0.5)) * height,
  };
}

export function sourceToScreen(
  sourceX: number,
  sourceY: number,
  width: number,
  height: number,
  dragZoom = 0,
): ScreenPoint {
  const targetX = 2 * (sourceX / Math.max(width, 1) - 0.5);
  const targetY = 2 * ((1 - sourceY / Math.max(height, 1)) - 0.5);
  const { dragScale, radial } = distortionMotion(dragZoom);
  let x = targetX / distortionConfig.baseScale;
  let y = targetY / distortionConfig.baseScale;

  for (let iteration = 0; iteration < 16; iteration += 1) {
    const metricX = x * distortionConfig.horizontalMetric;
    const radiusSquared = metricX * metricX + y * y;
    const scaleX = (
      distortionConfig.baseScale + radial * radiusSquared
    ) * dragScale;
    const scaleY = (
      distortionConfig.baseScale
      + radial * distortionConfig.verticalMultiplier * radiusSquared
    ) * dragScale;
    x = targetX / Math.max(0.12, scaleX);
    y = targetY / Math.max(0.12, scaleY);
  }

  return {
    x: (x * 0.5 + 0.5) * width,
    y: (1 - (y * 0.5 + 0.5)) * height,
  };
}

export function warpedRect(
  rect: { x: number; y: number; width: number; height: number },
  viewportWidth: number,
  viewportHeight: number,
  dragZoom = 0,
): ScreenRect {
  const points = [
    sourceToScreen(rect.x, rect.y, viewportWidth, viewportHeight, dragZoom),
    sourceToScreen(rect.x + rect.width, rect.y, viewportWidth, viewportHeight, dragZoom),
    sourceToScreen(rect.x, rect.y + rect.height, viewportWidth, viewportHeight, dragZoom),
    sourceToScreen(rect.x + rect.width, rect.y + rect.height, viewportWidth, viewportHeight, dragZoom),
  ];
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const right = Math.max(...xs);
  const bottom = Math.max(...ys);

  return {
    left,
    top,
    width: Math.max(8, right - left),
    height: Math.max(8, bottom - top),
  };
}
