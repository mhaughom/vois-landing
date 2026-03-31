type ExtrapolateType = 'clamp' | 'extend';

interface InterpolateOptions {
  easing?: (t: number) => number;
  extrapolateLeft?: ExtrapolateType;
  extrapolateRight?: ExtrapolateType;
}

export function interpolate(
  value: number,
  inputRange: [number, number],
  outputRange: [number, number],
  options?: InterpolateOptions,
): number {
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;
  const extrapolateLeft = options?.extrapolateLeft ?? 'extend';
  const extrapolateRight = options?.extrapolateRight ?? 'extend';

  if (value <= inMin && extrapolateLeft === 'clamp') return outMin;
  if (value >= inMax && extrapolateRight === 'clamp') return outMax;

  let t = (value - inMin) / (inMax - inMin);
  if (options?.easing) t = options.easing(Math.max(0, Math.min(1, t)));

  return outMin + (outMax - outMin) * t;
}

// Easing functions matching Remotion's API
export const Easing = {
  cubic: (t: number) => t * t * t,
  in: (fn: (t: number) => number) => fn,
  out:
    (fn: (t: number) => number) =>
    (t: number) =>
      1 - fn(1 - t),
  inOut:
    (fn: (t: number) => number) =>
    (t: number) =>
      t < 0.5 ? fn(t * 2) / 2 : 1 - fn((1 - t) * 2) / 2,
  back:
    (s: number) =>
    (t: number) =>
      t * t * ((s + 1) * t - s),
};
