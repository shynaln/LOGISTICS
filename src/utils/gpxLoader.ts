import GPXParser from "gpxparser";

export async function loadGPX(url: string): Promise<[number, number][]> {
  const res = await fetch(url);
  const text = await res.text();

  const gpx = new GPXParser();
  gpx.parse(text);

  const points: [number, number][] = [];

  gpx.tracks.forEach((track: any) => {
    track.points.forEach((p: any) => {
      points.push([p.lat, p.lon]);
    });
  });

  return points;
}