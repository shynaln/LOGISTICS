import GPXParser from "gpxparser"

export async function loadGPX(url: string): Promise<[number, number][]> {
  const res = await fetch(url)
  const text = await res.text()

  const gpx = new GPXParser()
  gpx.parse(text)

  if (!gpx.tracks.length) return []

  const points: [number, number][] = gpx.tracks[0].points
    .filter((p: any) => p.lat != null && p.lon != null)
    .map((p: any) => [p.lat, p.lon])

  return points
}