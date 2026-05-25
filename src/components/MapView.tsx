import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";

import {
  useEffect,
  useState
} from "react";

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

  center,
  selected

}: {

  center: [number, number];

  selected?: Vehicle;
}) {

  const map = useMap();

  useEffect(() => {

    if (
      selected?.id !== "gps-live"
    ) return;

    map.flyTo(center, 17, {
      duration: 1.5
    });

  }, [center, map, selected]);

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

    for (
      let i = 0;
      i < trkpts.length;
      i++
    ) {

      const lat =
        trkpts[i]
          .getAttribute("lat");

      const lon =
        trkpts[i]
          .getAttribute("lon");

      if (!lat || !lon)
        continue;

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

  const [
  routes,
  setRoutes
] = useState<
  Record<
    string,
    [number, number][]
  >
>({});

  useEffect(() => {

    async function loadRoutes() {

      const loaded:
        Record<
          string,
          [number, number][]
        > = {};

      for (const v of vehicles) {

        if (!v.route)
          continue;

        if (loaded[v.route])
          continue;

        const points =
          await fetchGPX(
            v.route
          );

        loaded[v.route] =
          points;
      }

      setRoutes(loaded);
    }

    loadRoutes();

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
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ChangeView

        center={center}

        selected={selected}
      />

      {
        Object.entries(routes)
          .map(([path, points]: any) => (

          <Polyline

            key={`${path}-${points.length}`}

            positions={points}

            color={
              routeColor[path]
                || "#ef4444"
            }

            weight={6}

            opacity={0.8}
          />
        ))
      }

      {
        vehicles.map((v) => {

          let position:
            [number, number]
            | null = null;

          if (

            v.lat !== undefined &&

            v.lng !== undefined

          ) {

            position = [
              v.lat,
              v.lng
            ];
          }

          else if (
            v.route &&
            routes[v.route]
          ) {

            const points =
              routes[v.route] || [];

            if (
              points.length > 0
            ) {

              let offset = 0;

if (v.id === "xe1") {

  offset = 0;
}

else if (v.id === "xe2") {

  offset = 30;
}

else if (v.id === "xe3") {

  offset = 60;
}

const index =
  Math.floor(

    (
      (
        (v.progress || 0) + offset
      ) / 100
    )

    * points.length
  );
    if (points.length > 0) {

  position =
    points[
      Math.min(
        index % points.length,
        points.length - 1
      )
    ];
}
            }
          }

          if (!position)
            return null;

          return (

            <Marker

              key={`${v.id}-${v.route}`}

              position={position}

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

                      fontWeight:
                        "bold"
                    }}
                  >

                    {
                      v.running
                        ? "RUNNING"
                        : "STOP"
                    }

                  </span>

                  <br />

                  Progress:
                  {" "}
                  {
                    v.progress || 0
                  }
                  %

                  <br />

                  Latitude:
                  {" "}
                  {position[0]
                    .toFixed(6)}

                  <br />

                  Longitude:
                  {" "}
                  {position[1]
                    .toFixed(6)}

                </div>

              </Popup>

            </Marker>
          );
        })
      }

    </MapContainer>
  );
}