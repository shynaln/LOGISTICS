import { useEffect, useState } from "react";

import Tracking from "./pages/Tracking";
import Routes from "./pages/Routes";
import Drivers from "./pages/Drivers";
import Orders from "./pages/Orders";

import "./vehicleEngine";

import {
  listenSensors
} from "./services/firebase";

import {
  getDatabase,
  ref,
  onValue
} from "firebase/database";

import {
  CheckCircle,
  Thermometer,
  Droplets,
  Flame,
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

  const [drivers, setDrivers] =
    useState<any[]>([]);

  const [orders, setOrders] =
    useState<any[]>([]);

  const [sensor, setSensor] =
    useState({

      temperature:0,

      humidity:0,

      gas_status:"AN TOAN"
    });

  const [dashboard, setDashboard] =
    useState({

      delivered:0
    });

  ////////////////////////////////////////////////////
  // FIREBASE
  ////////////////////////////////////////////////////

  useEffect(()=>{

    //////////////////////////////////////////////////
    // SENSOR
    //////////////////////////////////////////////////

    listenSensors((data:any)=>{

      setSensor({

        temperature:
          data.temperature || 0,

        humidity:
          data.humidity || 0,

        gas_status:
          data.gas_status || "AN TOAN"
      });
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
            data.delivered || 0
        });
      }
    );

    //////////////////////////////////////////////////
    // DRIVERS
    //////////////////////////////////////////////////

    onValue(

      ref(db,"drivers"),

      (snap)=>{

        const data = snap.val() || {};

        const arr = Object.entries(data).map(

          ([id, value]:any)=>({

            id,

            ...value
          })
        );

        setDrivers(arr);
      }
    );

    //////////////////////////////////////////////////
    // ORDERS
    //////////////////////////////////////////////////

    onValue(

      ref(db,"orders"),

      (snap)=>{

        const data = snap.val() || {};

        const arr = Object.entries(data).map(

          ([id, value]:any)=>({

            id,

            ...value
          })
        );

        setOrders(arr);
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

          <h1 className="
            text-4xl
            font-bold
            text-gray-800
          ">
            Dashboard
          </h1>

          <p className="
            text-gray-500
            mt-1
          ">
            Smart logistics monitoring realtime
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
            SYSTEM ONLINE
          </span>

        </div>

      </div>

      {/* STATS */}

      <div className="
        grid
        grid-cols-4
        gap-5
      ">

        <Stat
          title="Drivers"
          value={drivers.length}
          icon={MapPinned}
          color="purple"
        />

        <Stat
          title="Orders"
          value={orders.length}
          icon={CheckCircle}
          color="red"
        />

        <Stat
          title="Delivered"
          value={dashboard.delivered}
          icon={CheckCircle}
          color="green"
        />

        <Stat
          title="Online"
          value={"ACTIVE"}
          icon={CheckCircle}
          color="blue"
        />

      </div>

      {/* SENSOR */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-5
      ">

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
          value={`${sensor.gas_status}`}
          icon={Flame}
          color="from-red-500 to-pink-500"
        />

      </div>

      {/* DRIVERS */}

      <div className="
        bg-white/70
        backdrop-blur-2xl
        rounded-3xl
        shadow-2xl
        border
        p-6
      ">

        <div className="mb-6">

          <h2 className="
            text-2xl
            font-bold
            text-gray-800
          ">
            Driver List
          </h2>

          <p className="
            text-sm
            text-gray-500
          ">
            Firebase realtime drivers
          </p>

        </div>

        <div className="
          overflow-auto
        ">

          <table className="
            w-full
          ">

            <thead>

              <tr className="
                text-left
                border-b
              ">

                <th className="py-3">Name</th>
                <th className="py-3">Phone</th>
                <th className="py-3">Telegram</th>
                <th className="py-3">Truck</th>
                <th className="py-3">Route</th>
                <th className="py-3">Status</th>

              </tr>

            </thead>

            <tbody>

              {drivers.map((d:any)=>(

                <tr
                  key={d.id}
                  className="
                    border-b
                    hover:bg-gray-50
                  "
                >

                  <td className="
                    py-4
                    font-semibold
                  ">
                    {d.name}
                  </td>

                  <td>{d.phone}</td>

                  <td>{d.telegram}</td>

                  <td>{d.truck}</td>

                  <td>{d.route}</td>

                  <td>

                    <span className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-bold

                      ${
                        d.status === "online"

                        ? `
                          bg-green-500
                          text-white
                        `

                        : `
                          bg-red-500
                          text-white
                        `
                      }
                    `}>

                      {d.status}

                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

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