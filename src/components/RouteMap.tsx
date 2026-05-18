import { MapContainer, TileLayer, Polyline } from "react-leaflet"
import { useEffect, useState } from "react"
import { loadGPX } from "../utils/loadGPX"

export default function RouteMap({ routeFile }: { routeFile: string }) {
  const [route, setRoute] = useState<[number, number][]>([])

  useEffect(() => {
    loadGPX(routeFile).then(setRoute)
  }, [routeFile])

  return (
    <MapContainer
      center={route[0] || [10.78, 106.68]}
      zoom={13}
      style={{ height: "100%" }}
      preferCanvas
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {route.length > 0 && (
        <Polyline positions={route} color="blue" />
      )}
    </MapContainer>
  )
}