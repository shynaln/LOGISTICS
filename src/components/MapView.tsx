import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";

import { useEffect, useRef, useState } from "react";

import * as L from "leaflet";

export type Vehicle = {
  id: string;

  driver?: string;

  running?: number;

  lat?: number;
  lng?: number;

  progress?: number;

  route?: string;
};

type MapViewProps = {
  center: [number, number];

  vehicles: Vehicle[];

  route?: string;

  selected?: Vehicle;
};

const truckIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/12178/12178010.png",

  iconSize: [52, 52],

  iconAnchor: [26, 26],

  popupAnchor: [0, -20]
});

function ChangeView({
  center
}: {
  center: [number, number];
}) {

  const map = useMap();

  useEffect(() => {

    map.flyTo(center, 17, {
      duration: 1.5
    });

  }, [center, map]);

  return null;
}

function FitBounds({
  points
}: {
  points: [number, number][];
}) {

  const map = useMap();

  useEffect(() => {

    if (!points.length) return;

    const bounds =
      L.latLngBounds(points);

    map.fitBounds(bounds, {
      padding: [30, 30]
    });

  }, [points, map]);

  return null;
}

async function fetchGPX(
  path: string
): Promise<[number, number][]> {

  try {

    const res =
      await fetch(path);

    const text =
      await res.text();

    const parser =
      new DOMParser();

    const xml =
      parser.parseFromString(
        text,
        "text/xml"
      );

    const trkpts =
      xml.getElementsByTagName("trkpt");

    const points:
      [number, number][] = [];

    for (let i = 0; i < trkpts.length; i++) {

      const lat =
        trkpts[i].getAttribute("lat");

      const lon =
        trkpts[i].getAttribute("lon");

      if (!lat || !lon) continue;

      points.push([
        Number(lat),
        Number(lon)
      ]);
    }

    return points;

  } catch (err) {

    console.error(
      "GPX LOAD ERROR:",
      err
    );

    return [];
  }
}

export default function MapView({
  center,
  vehicles,
  route,
  selected
}: MapViewProps) {

  const [routePoints, setRoutePoints] =
    useState<[number, number][]>([]);

  const [
    vehiclePositions,
    setVehiclePositions
  ] = useState<
    Record<string, [number, number]>
  >({});

  const routeIndexRef =
    useRef<Record<string, number>>({});

  useEffect(() => {

    if (!route) {

      setRoutePoints([]);

      return;
    }

    fetchGPX(route)
      .then(setRoutePoints);

  }, [route]);

  useEffect(() => {

    let intervals:
      ReturnType<
        typeof setInterval
      >[] = [];

    (
      Array.isArray(vehicles)
      ? vehicles
      : []
    ).forEach(async (vehicle) => {

      if (!vehicle.route) return;

      const points =
        await fetchGPX(
          vehicle.route
        );

      if (!points.length) return;

      if (
        !vehiclePositions[
          vehicle.id
        ]
      ) {

        setVehiclePositions(prev => ({
          ...prev,

          [vehicle.id]:
            points[0]
        }));

        routeIndexRef.current[
          vehicle.id
        ] = 0;
      }

      if (!vehicle.running) return;

      const interval =
        setInterval(() => {

          const currentIndex =
            routeIndexRef.current[
              vehicle.id
            ] || 0;

          if (
            currentIndex >=
            points.length - 1
          ) {

            clearInterval(
              interval
            );

            return;
          }

          const nextIndex =
            currentIndex + 1;

          routeIndexRef.current[
            vehicle.id
          ] = nextIndex;

          setVehiclePositions(
            prev => ({

              ...prev,

              [vehicle.id]:
                points[nextIndex]
            })
          );

        }, 1000);

      intervals.push(interval);

    });

    return () => {

      intervals.forEach(i =>
        clearInterval(i)
      );
    };

  }, [vehicles]);

  const routeColor:
    Record<string, string> = {

    "/routes/R1.gpx":
      "#ef4444",

    "/routes/R2.gpx":
      "#3b82f6",

    "/routes/R3.gpx":
      "#22c55e"
  };

  return (

    <MapContainer
      center={center}
      zoom={13}
      style={{
        height: "100%",
        width: "100%"
      }}
    >

      <TileLayer
        url="
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
"
      />

      {center[0] !== 0 &&
      center[1] !== 0 && (

        <ChangeView
          center={center}
        />

      )}

      {routePoints.length > 0 && (

        <FitBounds
          points={routePoints}
        />

      )}

      {route &&
        routePoints.length > 0 && (

        <Polyline
          positions={routePoints}
          color={
            routeColor[route]
              || "#ef4444"
          }
          weight={6}
          opacity={0.8}
        />
      )}

      {
      (
        Array.isArray(vehicles)
        ? vehicles
        : []
      ).map((v) => {

        const livePos:
          [number, number] | null =

          v.lat !== undefined &&
          v.lng !== undefined

            ? [v.lat, v.lng]

            : null;

        const demoPos =
          vehiclePositions[
            v.id
          ];

        const pos =
          livePos || demoPos;

        if (!pos) return null;

        return (

          <Marker
            key={v.id}
            position={pos}
            icon={truckIcon}
          >

            <Popup>

              <div
                style={{
                  fontSize: 13,
                  minWidth: 160
                }}
              >

                <b>
                  🚚
                  {" "}
                  {v.id.toUpperCase()}
                </b>

                <br />
                <br />

                Driver:
                {" "}
                {v.driver}

                <br />

                Status:
                {" "}

                <span
                  style={{
                    color:
                      v.running
                        ? "green"
                        : "red",

                    fontWeight: "bold"
                  }}
                >

                  {
                    v.running
                      ? "RUNNING"
                      : "STOP"
                  }

                </span>

                <br />

                Latitude:
                {" "}
                {pos[0]
                  .toFixed(6)}

                <br />

                Longitude:
                {" "}
                {pos[1]
                  .toFixed(6)}

              </div>

            </Popup>

          </Marker>
        );
      })}

    </MapContainer>
  );
}