import { useState, useEffect } from "react";
import MapView from "../components/MapView";

import {
  Truck,
  Satellite,
  Activity,
  GaugeCircle,
  Thermometer,
  Droplets,
  Flame,
  MapPinned
} from "lucide-react";

import {
  CircularProgressbar,
  buildStyles
} from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

import {
  listenVehicles,
  listenSensors
} from "../services/firebase";

////////////////////////////////////////////////////////////////////////////////
// TYPES
////////////////////////////////////////////////////////////////////////////////

type Mode = "demo" | "live";

type Vehicle = {
  id: string;
  driver: string;

  running: number;

  speed: number;
  load: number;

  temp: number;
  humidity: number;

  gasText: string;
  gasDanger: boolean;

  route: string;

  progress: number;

  duration: number;

  lat?: number;
  lng?: number;
};

////////////////////////////////////////////////////////////////////////////////
// DEMO
////////////////////////////////////////////////////////////////////////////////

const demoVehicles: Vehicle[] = [

  {
    id: "xe1",

    driver: "Driver A",

    running: 1,

    speed: 62,

    load: 70,

    temp: 30,

    humidity: 55,

    gasText: "AN TOAN",

    gasDanger: false,

    route: "/routes/R1.gpx",

    progress: 45,

    duration: 120
  },

  {
    id: "xe2",

    driver: "Driver B",

    running: 0,

    speed: 0,

    load: 20,

    temp: 28,

    humidity: 60,

    gasText: "AN TOAN",

    gasDanger: false,

    route: "/routes/R2.gpx",

    progress: 0,

    duration: 60
  },

  {
    id: "xe3",

    driver: "Driver C",

    running: 1,

    speed: 48,

    load: 55,

    temp: 35,

    humidity: 72,

    gasText: "NGUY HIEM",

    gasDanger: true,

    route: "/routes/R3.gpx",

    progress: 70,

    duration: 60
  }
];

////////////////////////////////////////////////////////////////////////////////
// COMPONENT
////////////////////////////////////////////////////////////////////////////////

export default function Tracking() {

  const [mode, setMode] =
    useState<Mode>("demo");

  const [vehicles, setVehicles] =
    useState<Vehicle[]>(demoVehicles);

  const [selected, setSelected] =
    useState<Vehicle>(demoVehicles[0]);
  useEffect(() => {

  const found = vehicles.find(

    v => v.id === selected?.id
  );

  if (found) {

    setSelected(found);
  }

}, [vehicles]);
//////////////////////////////////////////////////////
  // VEHICLE ANIMATION STATE
  //////////////////////////////////////////////////////

  const [vehicleStates, setVehicleStates] = useState<any>({
    xe1: {
      speed: 0,
      progress: 0
    },

    xe2: {
      speed: 0,
      progress: 0
    },

    xe3: {
      speed: 0,
      progress: 0
    }
  });
  ////////////////////////////////////////////////////////////////////////////
  // DEMO FIREBASE
  ////////////////////////////////////////////////////////////////////////////

  useEffect(() => {

  if (mode !== "demo") return;

  let firebaseData: any = {};

  listenVehicles((data: any) => {

    firebaseData = data;
  });

  const interval = setInterval(() => {

    setVehicleStates((prev: any) => {

      const updated: any = {

  xe1: {
    ...prev.xe1
  },

  xe2: {
    ...prev.xe2
  },

  xe3: {
    ...prev.xe3
  }
};

      (["xe1", "xe2", "xe3"] as const).forEach((id) => {

        const running = Number(
        firebaseData?.[id]?.running || 0
      );

        ////////////////////////////////////////////////////
        // RUNNING
        ////////////////////////////////////////////////////

        if (running === 1) {

          // speed tăng từ từ lên 70

          if (updated[id].speed < 70) {

            updated[id].speed +=
              Math.random() * 5;

          } else {

            // dao động 60-70

            updated[id].speed =
              60 + Math.random() * 10;
          }

          // progress chạy route

          updated[id].progress += 0.3;

          if (updated[id].progress > 100) {

            updated[id].progress = 0;
          }
        }

        ////////////////////////////////////////////////////
        // STOP
        ////////////////////////////////////////////////////

        else {

          updated[id].speed = 0;
          updated[id].progress = 0;
        }
      });

      //////////////////////////////////////////////////////
// UPDATE VEHICLES
//////////////////////////////////////////////////////

setVehicles(prevVehicles =>

  prevVehicles.map(vehicle => {

    //////////////////////////////////////////////////
    // LOCAL STATE
    //////////////////////////////////////////////////

    const state =
      updated[vehicle.id];

    //////////////////////////////////////////////////
    // FIREBASE VEHICLE
    //////////////////////////////////////////////////

    const firebaseVehicle =
      firebaseData?.[vehicle.id] || {};

    //////////////////////////////////////////////////
    // RUNNING
    //////////////////////////////////////////////////

    const running = Number(
      firebaseVehicle.running || 0
    );

    //////////////////////////////////////////////////
    // ROUTE
    //////////////////////////////////////////////////
let finalRoute = "";

if (vehicle.id === "xe1") {

  finalRoute =
    "/routes/R1.gpx";
}

else if (vehicle.id === "xe2") {

  finalRoute =
    "/routes/R2.gpx";
}

else if (vehicle.id === "xe3") {

  finalRoute =
    "/routes/R3.gpx";
}
    //////////////////////////////////////////////////
    // RETURN
    //////////////////////////////////////////////////

    return {

      ...vehicle,
      
      //////////////////////////////////////////////////
      // RUNNING STATUS
      //////////////////////////////////////////////////

      running,

      //////////////////////////////////////////////////
      // AUTO LOAD GPX
      //////////////////////////////////////////////////

      route:

  running === 1

    ? finalRoute

    : "",

      //////////////////////////////////////////////////
      // SPEED
      //////////////////////////////////////////////////

      speed:

        running === 1

          ? Math.floor(state.speed)

          : 0,

      //////////////////////////////////////////////////
      // PROGRESS
      //////////////////////////////////////////////////

      progress:

        running === 1

          ? Math.floor(state.progress)

          : 0
    };
  })
);

      return updated;
    });

  }, 1000);

  return () => clearInterval(interval);

}, [mode]);
////////////////////////////////////////////////////////////////////////////
// LIVE FIREBASE
////////////////////////////////////////////////////////////////////////////

useEffect(() => {

  if (mode !== "live") return;

  let sensorData: any = {};

  ////////////////////////////////////////////////////
  // LISTEN SENSOR
  ////////////////////////////////////////////////////

  listenSensors((data: any) => {

    sensorData = data;
  });

  ////////////////////////////////////////////////////
  // UPDATE LIVE VEHICLE
  ////////////////////////////////////////////////////

  const interval = setInterval(() => {

    //////////////////////////////////////////////////
    // CHECK GPS VALID
    //////////////////////////////////////////////////

    const lat =
      Number(sensorData?.lat);

    const lng =
      Number(sensorData?.lon);

    //////////////////////////////////////////////////
    // INVALID GPS
    //////////////////////////////////////////////////

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat === 0 ||
      lng === 0
    ) return;

    //////////////////////////////////////////////////
    // LIVE VEHICLE
    //////////////////////////////////////////////////

    const liveVehicle = {

      id: "gps-live",

      driver: "GPS REALTIME",

      running: 1,

      speed:
        Number(
          sensorData?.speed || 0
        ),

      load: 0,

      temp:
        Number(
          sensorData?.temperature || 0
        ),

      humidity:
        Number(
          sensorData?.humidity || 0
        ),

      gasText:
        sensorData?.gas_status
          || "AN TOAN",

      gasDanger:
        sensorData?.gas_status
          === "NGUY HIEM",

      route: "",

      progress: 100,

      duration: 0,

      lat,

      lng
    };

    //////////////////////////////////////////////////
    // UPDATE
    //////////////////////////////////////////////////

    setVehicles([liveVehicle]);

    setSelected(liveVehicle);

  }, 1000);

  return () =>
    clearInterval(interval);

}, [mode]);
  ////////////////////////////////////////////////////////////////////////////
  // SWITCH MODE
  ////////////////////////////////////////////////////////////////////////////

  function switchMode(m: Mode){

    setMode(m);

    if(m==="demo"){

      setVehicles(demoVehicles);

      setSelected(demoVehicles[0]);
    }
  }

  ////////////////////////////////////////////////////////////////////////////
  // MAP CENTER
  ////////////////////////////////////////////////////////////////////////////

  const mapCenter:[number,number] =

    mode === "live" &&
    vehicles[0]?.lat !== undefined &&
    vehicles[0]?.lng !== undefined

      ? [
          vehicles[0].lat,
          vehicles[0].lng
        ]

      : [10.9716,108.1115];

  ////////////////////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////////////////////

  return (

    <div className="
      flex
      h-full
      gap-5
      bg-gradient-to-br
      from-slate-100
      via-gray-100
      to-slate-200
      p-5
      rounded-[32px]
    ">

      {/* LEFT */}

      <div className="
        w-80
        bg-white/70
        backdrop-blur-2xl
        rounded-[32px]
        shadow-2xl
        border
        p-5
        flex
        flex-col
      ">

        {/* TOP */}

        <div className="
          flex
          justify-between
          items-center
          mb-6
        ">

          <div>

            <h2 className="
              text-2xl
              font-bold
              text-gray-800
            ">
              Fleet
            </h2>

            <p className="text-sm text-gray-500">
              Vehicle management
            </p>

          </div>

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-gradient-to-r
            from-blue-500
            to-indigo-500
            text-white
            flex
            items-center
            justify-center
            shadow-lg
          ">

            <Truck />

          </div>

        </div>

        {/* MODE */}

        <div className="
          flex
          gap-3
          mb-6
        ">

          <button

            onClick={()=>switchMode("demo")}

            className={`
              flex-1
              py-3
              rounded-2xl
              font-semibold
              transition-all

              ${
                mode==="demo"

                  ? `
                    bg-gradient-to-r
                    from-blue-500
                    to-indigo-500
                    text-white
                    shadow-lg
                  `

                  : `
                    bg-gray-100
                    text-gray-600
                  `
              }
            `}
          >

            DEMO

          </button>

          <button

            onClick={()=>switchMode("live")}

            className={`
              flex-1
              py-3
              rounded-2xl
              font-semibold
              transition-all

              ${
                mode==="live"

                  ? `
                    bg-gradient-to-r
                    from-green-500
                    to-emerald-500
                    text-white
                    shadow-lg
                  `

                  : `
                    bg-gray-100
                    text-gray-600
                  `
              }
            `}
          >

            LIVE

          </button>

        </div>

        {/* VEHICLES */}

        <div className="
          flex-1
          overflow-auto
        ">

          {vehicles.map((v)=>(

            <div

              key={v.id}

              onClick={()=>setSelected(v)}

              className={`
                mb-4
                p-4
                rounded-3xl
                cursor-pointer
                transition-all
                border

                ${
                  selected.id===v.id

                    ? `
                      bg-gradient-to-r
                      from-blue-500
                      to-indigo-500
                      text-white
                      shadow-xl
                    `

                    : `
                      bg-white
                      hover:shadow-lg
                    `
                }
              `}
            >

              <div className="
                flex
                justify-between
                items-center
              ">

                <div className="
                  flex
                  items-center
                  gap-3
                ">

                  <div className={`
                    w-12
                    h-12
                    rounded-2xl
                    flex
                    items-center
                    justify-center

                    ${
                      selected.id===v.id
                        ? "bg-white/20"
                        : "bg-blue-100 text-blue-600"
                    }
                  `}>

                    <Truck />

                  </div>

                  <div>

                    <h2 className="font-bold">
                      {v.id.toUpperCase()}
                    </h2>

                    <p className={`
                      text-sm

                      ${
                        selected.id===v.id
                          ? "text-white/70"
                          : "text-gray-500"
                      }
                    `}>
                      {v.driver}
                    </p>

                  </div>

                </div>

                <div
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-semibold

                    ${
                      v.running

                        ? `
                          bg-green-500
                          text-white
                        `

                        : `
                          bg-red-500
                          text-white
                        `
                    }
                  `}
                >

                  {v.running
                    ? "RUNNING"
                    : "STOP"}

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* MAP */}

      <div className="
        flex-1
        bg-white/70
        backdrop-blur-2xl
        rounded-[32px]
        shadow-2xl
        border
        overflow-hidden
        flex
        flex-col
      ">

        {/* TOP */}

        <div className="
          px-6
          py-5
          border-b
          flex
          justify-between
          items-center
        ">

          <div>

            <h2 className="
              text-2xl
              font-bold
              text-gray-800
            ">
              Live Tracking
            </h2>

            <p className="text-sm text-gray-500">
              Realtime GPS monitoring
            </p>

          </div>

          <div
            className={`
              flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              text-sm
              font-semibold

              ${
                mode==="demo"

                  ? `
                    bg-yellow-100
                    text-yellow-700
                  `

                  : `
                    bg-green-100
                    text-green-700
                  `
              }
            `}
          >

            {
              mode==="demo"

                ? <Activity size={16}/>

                : <Satellite size={16}/>
            }

            {
              mode==="demo"

                ? "SIMULATION"

                : "GPS LIVE"
            }

          </div>

        </div>

        {/* MAPVIEW */}

        <div className="flex-1">

          <MapView
        center={mapCenter}
        vehicles={vehicles}
        selected={selected}
      />

        </div>

      </div>

      {/* RIGHT */}

      <div className="
        w-96
        flex
        flex-col
        gap-5
      ">

        {/* INFO */}

        <div className="
          bg-white/70
          backdrop-blur-2xl
          rounded-[32px]
          shadow-2xl
          border
          p-6
        ">

          <div className="
            flex
            justify-between
            items-center
            mb-5
          ">

            <div>

              <h2 className="
                text-3xl
                font-bold
                text-gray-800
              ">

                {selected.id.toUpperCase()}

              </h2>

              <p className="text-gray-500">
                {selected.driver}
              </p>

            </div>

            <div className="
              w-16
              h-16
              rounded-3xl
              bg-gradient-to-r
              from-blue-500
              to-indigo-500
              text-white
              flex
              items-center
              justify-center
              shadow-lg
            ">

              <Truck size={32} />

            </div>

          </div>

          {/* GRID */}

          <div className="
            grid
            grid-cols-2
            gap-4
          ">

            <MiniCard
              icon={<GaugeCircle size={22}/>}
              label="Speed"
              value={`${selected.speed} km/h`}
            />

            <MiniCard
              icon={<Activity size={22}/>}
              label="Progress"
              value={`${selected.progress}%`}
            />

            <MiniCard
              icon={<MapPinned size={22}/>}
              label="Route"
              value={
                selected.route
                  ? "ACTIVE"
                  : "LIVE GPS"
              }
            />

            <MiniCard
              icon={<Truck size={22}/>}
              label="Status"
              value={
                selected.running
                  ? "RUNNING"
                  : "STOP"
              }
            />

          </div>

          {/* PROGRESS */}

          <div className="mt-6">

            <div className="
              flex
              justify-between
              mb-2
              text-sm
            ">

              <span className="font-medium">
                Delivery Progress
              </span>

              <span className="font-bold text-blue-600">
                {selected.progress}%
              </span>

            </div>

            <div className="
              w-full
              h-4
              bg-gray-200
              rounded-full
              overflow-hidden
            ">

              <div

                className="
                  h-4
                  rounded-full
                  bg-gradient-to-r
                  from-blue-500
                  to-indigo-500
                  transition-all
                  duration-700
                "

                style={{
                  width:
                    `${selected.progress}%`
                }}
              />

            </div>

          </div>

        </div>

        {/* SENSOR */}

        <div className="
          bg-white/70
          backdrop-blur-2xl
          rounded-[32px]
          shadow-2xl
          border
          p-6
          flex-1
        ">

          <h2 className="
            text-2xl
            font-bold
            text-gray-800
            mb-6
          ">
            Sensors
          </h2>

          <div className="
            flex
            flex-col
            items-center
            gap-6
          ">

            <Gauge
              label="Temperature"
              value={selected.temp}
              max={100}
              unit="°C"
              icon={<Thermometer />}
              big
            />

            <div className="
              flex
              justify-between
              w-full
            ">

              <Gauge
                label="Humidity"
                value={selected.humidity}
                max={100}
                unit="%"
                icon={<Droplets />}
              />

              <Gauge
                label="Gas"
                value={
                  selected.gasDanger
                    ? 90
                    : 20
                }
                max={100}
                icon={<Flame />}
                danger={selected.gasDanger}
              />

            </div>

            <div
              className={`
                px-5
                py-3
                rounded-2xl
                text-sm
                font-bold
                shadow-lg

                ${
                  selected.gasDanger

                    ? `
                      bg-red-500
                      text-white
                    `

                    : `
                      bg-green-500
                      text-white
                    `
                }
              `}
            >

              {selected.gasText}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// MINI CARD
////////////////////////////////////////////////////////////////////////////////

function MiniCard({

  icon,
  label,
  value

}:any){

  return (

    <div className="
      bg-gray-50
      rounded-2xl
      p-4
    ">

      <div className="
        flex
        items-center
        gap-2
        text-blue-600
        mb-2
      ">

        {icon}

        <span className="
          text-sm
          font-medium
        ">
          {label}
        </span>

      </div>

      <h2 className="
        font-bold
        text-gray-800
      ">
        {value}
      </h2>

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// GAUGE
////////////////////////////////////////////////////////////////////////////////

function Gauge({

  value,
  max,
  label,
  unit,
  danger,
  big,
  icon

}: any) {

  const percent =
    (value/max)*100;

  const color =

    danger

      ? "#ef4444"

      : percent > 70

      ? "#f59e0b"

      : "#22c55e";

  return (

    <div className="
      flex
      flex-col
      items-center
    ">

      <div className="
        flex
        items-center
        gap-2
        mb-3
      ">

        <div className="
          text-gray-600
        ">
          {icon}
        </div>

        <span className="
          font-semibold
          text-gray-700
        ">
          {label}
        </span>

      </div>

      <div className={
        big
          ? "w-44 h-44"
          : "w-28 h-28"
      }>

        <CircularProgressbar

          value={percent}

          text={`${value}${unit || ""}`}

          styles={buildStyles({

            pathColor: color,

            textColor: "#111827",

            trailColor: "#e5e7eb",

            textSize:
              big
                ? "16px"
                : "18px"
          })}
        />

      </div>

    </div>
  );
}