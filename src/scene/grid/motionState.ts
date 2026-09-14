export interface MutableMotionValue {
  value: number;
}

export interface GridMotionState {
  dragProgress: MutableMotionValue;
  velocity: MutableMotionValue;
  transitionProgress: MutableMotionValue;
}

export interface GridMotionController {
  readonly motionState: GridMotionState;
  prepareTransition: () => void;
  setTransitionProgress: (progress: number) => void;
  resumeAfterTransition: () => void;
}

export function createGridMotionState(): GridMotionState {
  return {
    dragProgress: { value: 0 },
    velocity: { value: 0 },
    transitionProgress: { value: 0 },
  };
}
