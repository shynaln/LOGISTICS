import { useEffect, useState } from "react";

import MapView from "./components/MapView";

import Tracking from "./pages/Tracking";
import Routes from "./pages/Routes";
import Drivers from "./pages/Drivers";
import Orders from "./pages/Orders";

import "./vehicleEngine";

import {
  listenVehicles,
  listenSensors
} from "./services/firebase";

import {
  getDatabase,
  ref,
  onValue
} from "firebase/database";

import {
  Truck,
  CheckCircle,
  AlertTriangle,
  Thermometer,
  Droplets,
  Flame,
  Activity,
  MapPinned
} from "lucide-react";

////////////////////////////////////////////////////////////////////////////////
// APP
////////////////////////////////////////////////////////////////////////////////

export default function App() {

  const [page, setPage] = useState("dashboard");

  return (

    <div className="flex h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">

      {/* SIDEBAR */}

      <div className="w-64 bg-white/70 backdrop-blur-2xl border-r shadow-2xl p-6 flex flex-col">

        <div className="flex items-center gap-3 mb-10">

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-blue-500
            text-white
            flex
            items-center
            justify-center
            text-xl
            shadow-lg
          ">
            🚚
          </div>

          <div>

            <h1 className="font-bold text-xl">
              LOGISTICS
            </h1>

            <p className="text-xs text-gray-500">
              Smart IoT Dashboard
            </p>

          </div>

        </div>

        <nav className="space-y-3">

          <MenuItem
            label="Dashboard"
            active={page==="dashboard"}
            onClick={()=>setPage("dashboard")}
          />

          <MenuItem
            label="Tracking"
            active={page==="tracking"}
            onClick={()=>setPage("tracking")}
          />

          <MenuItem
            label="Routes"
            active={page==="routes"}
            onClick={()=>setPage("routes")}
          />

          <MenuItem
            label="Drivers"
            active={page==="drivers"}
            onClick={()=>setPage("drivers")}
          />

          <MenuItem
            label="Orders"
            active={page==="orders"}
            onClick={()=>setPage("orders")}
          />

        </nav>

        <div className="mt-auto">

          <div className="
            bg-gradient-to-r
            from-blue-500
            to-indigo-500
            text-white
            p-4
            rounded-2xl
            shadow-xl
          ">

            <p className="text-sm opacity-80">
              System Status
            </p>

            <div className="flex items-center gap-2 mt-2">

              <div className="
                w-3
                h-3
                rounded-full
                bg-green-300
                animate-pulse
              " />

              <span className="font-semibold">
                ONLINE
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* MAIN */}

      <div className="flex-1 p-6 overflow-auto">

        {page === "dashboard" && <Dashboard />}
        {page === "tracking" && <Tracking />}
        {page === "routes" && <Routes />}
        {page === "drivers" && <Drivers />}
        {page === "orders" && <Orders />}

      </div>

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// DASHBOARD
////////////////////////////////////////////////////////////////////////////////

function Dashboard() {

  ////////////////////////////////////////////////////
  // STATES
  ////////////////////////////////////////////////////

  const [vehicles, setVehicles] =
    useState<any[]>([]);

  const [sensor, setSensor] =
    useState({

      temperature:0,

      humidity:0,

      gas:0,

      gas_status:"AN TOAN"
    });

  const [gasAlertCount, setGasAlertCount] =
    useState(0);

  const [dashboard, setDashboard] =
    useState({

      delivered:0,

      currentVehicle:0
    });

  ////////////////////////////////////////////////////
  // FIREBASE
  ////////////////////////////////////////////////////

  useEffect(()=>{

    //////////////////////////////////////////////////
    // GPS
    //////////////////////////////////////////////////

    listenVehicles((data:any)=>{

      if(Array.isArray(data)){

        setVehicles(data);

      }else{

        setVehicles([]);
      }

    });

    //////////////////////////////////////////////////
    // SENSOR
    //////////////////////////////////////////////////

    listenSensors((data:any)=>{

      setSensor(data);

      if(
        data.gas_status &&
        data.gas_status !== "AN TOAN"
      ){
        setGasAlertCount(prev=>prev+1);
      }

    });

    //////////////////////////////////////////////////
    // DASHBOARD
    //////////////////////////////////////////////////

    const db = getDatabase();

    onValue(

      ref(db,"dashboard"),

      (snap)=>{

        const data =
          snap.val() || {};

        setDashboard({

          delivered:
            data.delivered || 0,

          currentVehicle:
            data.currentVehicle || 0
        });
      }
    );

  },[]);

  ////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="
        flex
        justify-between
        items-center
      ">

        <div>

          <h1 className="text-4xl font-bold text-gray-800">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Smart logistics monitoring system
          </p>

        </div>

        <div className="
          bg-white
          px-5
          py-3
          rounded-2xl
          shadow-lg
          flex
          items-center
          gap-3
        ">

          <div className="
            w-3
            h-3
            rounded-full
            bg-green-500
            animate-pulse
          " />

          <span className="font-semibold">
            Realtime Active
          </span>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-4 gap-5">

        <Stat
          title="Total Vehicles"
          value="3"
          icon={Truck}
          color="blue"
        />

        <Stat
          title="Delivered"
          value={dashboard.delivered}
          icon={CheckCircle}
          color="green"
        />

        <Stat
          title="Gas Alerts"
          value={gasAlertCount}
          icon={AlertTriangle}
          color="red"
        />

        <Stat
          title="Vehicle Progress"
          value={`${dashboard.currentVehicle}%`}
          icon={Activity}
          color="purple"
        />

      </div>

      {/* SENSOR */}

      <div className="grid grid-cols-3 gap-5">

        <SensorCard
          title="Temperature"
          value={`${sensor.temperature}°C`}
          icon={Thermometer}
          color="from-orange-400 to-red-500"
        />

        <SensorCard
          title="Humidity"
          value={`${sensor.humidity}%`}
          icon={Droplets}
          color="from-cyan-400 to-blue-500"
        />

        <SensorCard
          title="Gas Status"
          value={sensor.gas_status}
          icon={Flame}
          color="from-pink-500 to-rose-500"
        />

      </div>

      {/* MAP */}

      <div className="grid grid-cols-3 gap-5 h-[560px]">

        <div className="
          col-span-2
          bg-white/70
          backdrop-blur-2xl
          rounded-3xl
          shadow-2xl
          border
          overflow-hidden
        ">

          <div className="
            px-6
            py-4
            border-b
            flex
            justify-between
            items-center
          ">

            <div>

              <h2 className="font-bold text-lg">
                🗺️ Map Overview
              </h2>

              <p className="text-sm text-gray-500">
                Live GPS tracking
              </p>

            </div>

            <div className="
              bg-blue-100
              text-blue-600
              px-3
              py-1
              rounded-full
              text-sm
              font-medium
            ">

              LIVE

            </div>

          </div>

          <div className="h-[490px]">

            {
              vehicles.length > 0 && (

                <MapView

                  center={[
                    Number(vehicles[0].lat),
                    Number(vehicles[0].lng)
                  ]}

                  vehicles={vehicles}

                />

              )
            }

          </div>

        </div>

        {/* RIGHT PANEL */}

        <div className="flex flex-col gap-5">

          {/* CURRENT VEHICLE */}

          <div className="
            bg-white/70
            backdrop-blur-2xl
            rounded-3xl
            shadow-2xl
            p-6
            border
          ">

            <div className="
              flex
              justify-between
              items-center
            ">

              <div>

                <p className="text-gray-500">
                  Current Vehicle
                </p>

                <h2 className="
                  text-5xl
                  font-bold
                  text-blue-600
                  mt-2
                ">

                  {dashboard.currentVehicle}%

                </h2>

              </div>

              <div className="
                w-16
                h-16
                rounded-2xl
                bg-blue-100
                text-blue-600
                flex
                items-center
                justify-center
              ">

                <Truck size={32} />

              </div>

            </div>

            <div className="
              w-full
              h-4
              bg-gray-200
              rounded-full
              mt-6
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
                    `${dashboard.currentVehicle}%`
                }}
              />

            </div>

          </div>

          {/* GPS INFO */}

          <div className="
            bg-white/70
            backdrop-blur-2xl
            rounded-3xl
            shadow-2xl
            p-6
            border
            flex-1
          ">

            <div className="
              flex
              items-center
              gap-3
              mb-5
            ">

              <div className="
                w-12
                h-12
                rounded-2xl
                bg-green-100
                text-green-600
                flex
                items-center
                justify-center
              ">

                <MapPinned />

              </div>

              <div>

                <h2 className="font-bold">
                  GPS Information
                </h2>

                <p className="text-sm text-gray-500">
                  Realtime coordinates
                </p>

              </div>

            </div>

            <div className="space-y-4">

              <InfoRow
                label="Latitude"
                value={
                  vehicles[0]?.lat
                    ?.toFixed(6) || "-"
                }
              />

              <InfoRow
                label="Longitude"
                value={
                  vehicles[0]?.lng
                    ?.toFixed(6) || "-"
                }
              />

              <InfoRow
                label="Vehicle ID"
                value="Truck-01"
              />

              <InfoRow
                label="Status"
                value="ONLINE"
                green
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// MENU
////////////////////////////////////////////////////////////////////////////////

function MenuItem({

  label,
  active,
  onClick

}:any){

  return (

    <div

      onClick={onClick}

      className={`
        p-3
        rounded-2xl
        cursor-pointer
        transition-all
        duration-300
        font-medium

        ${
          active

            ? `
              bg-gradient-to-r
              from-blue-500
              to-indigo-500
              text-white
              shadow-lg
            `

            : `
              hover:bg-white
              hover:shadow-md
            `
        }
      `}
    >

      {label}

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// STAT
////////////////////////////////////////////////////////////////////////////////

function Stat({

  title,
  value,
  icon:Icon,
  color

}:any){

  const colors:any = {

    blue:
      "from-blue-500 to-indigo-500",

    green:
      "from-green-500 to-emerald-500",

    red:
      "from-red-500 to-pink-500",

    purple:
      "from-purple-500 to-violet-500"
  };

  return (

    <div className="
      bg-white/70
      backdrop-blur-2xl
      rounded-3xl
      p-5
      shadow-2xl
      border
      relative
      overflow-hidden
    ">

      <div className="
        flex
        justify-between
        items-center
      ">

        <div>

          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="
            text-3xl
            font-bold
            mt-2
          ">
            {value}
          </h2>

        </div>

        <div className={`
          w-14
          h-14
          rounded-2xl
          bg-gradient-to-r
          ${colors[color]}
          text-white
          flex
          items-center
          justify-center
          shadow-lg
        `}>

          <Icon size={28} />

        </div>

      </div>

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// SENSOR CARD
////////////////////////////////////////////////////////////////////////////////

function SensorCard({

  title,
  value,
  icon:Icon,
  color

}:any){

  return (

    <div className="
      bg-white/70
      backdrop-blur-2xl
      rounded-3xl
      shadow-2xl
      border
      p-5
      relative
      overflow-hidden
    ">

      <div className={`
        absolute
        top-0
        left-0
        w-full
        h-1
        bg-gradient-to-r
        ${color}
      `} />

      <div className="
        flex
        justify-between
        items-center
      ">

        <div>

          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="
            text-3xl
            font-bold
            mt-2
          ">
            {value}
          </h2>

        </div>

        <div className="
          w-14
          h-14
          rounded-2xl
          bg-gray-100
          flex
          items-center
          justify-center
        ">

          <Icon size={30} />

        </div>

      </div>

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// INFO ROW
////////////////////////////////////////////////////////////////////////////////

function InfoRow({

  label,
  value,
  green

}:any){

  return (

    <div className="
      flex
      justify-between
      items-center
      bg-gray-50
      rounded-2xl
      px-4
      py-3
    ">

      <span className="text-gray-500">
        {label}
      </span>

      <span className={`
        font-semibold

        ${
          green
            ? "text-green-600"
            : "text-gray-800"
        }
      `}>

        {value}

      </span>

    </div>
  );
}