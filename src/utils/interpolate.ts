export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothMove(
  prev: { lat: number; lon: number },
  next: { lat: number; lon: number },
  t: number
) {
  return {
    lat: lerp(prev.lat, next.lat, t),
    lon: lerp(prev.lon, next.lon, t)
  };
}