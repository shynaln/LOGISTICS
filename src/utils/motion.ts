export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function interpolate(p1: [number, number], p2: [number, number], t: number) {
  return [
    lerp(p1[0], p2[0], t),
    lerp(p1[1], p2[1], t)
  ];
}

export function getAngle(a: [number, number], b: [number, number]) {
  const dy = b[0] - a[0];
  const dx = b[1] - a[1];
  return Math.atan2(dy, dx) * 180 / Math.PI;
}