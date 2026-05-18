import { useEffect, useState } from "react";

import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  get
} from "firebase/database";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { loadGPX } from "../utils/loadGPX";

import {
  Truck,
  Play,
  Square,
  Route,
  GaugeCircle,
  CheckCircle2,
  Activity,
  MapPinned
} from "lucide-react";

////////////////////////////////////////////////////////////////////////////////
// CONFIG
////////////////////////////////////////////////////////////////////////////////

const ROUTES = ["R1", "R2", "R3"];

////////////////////////////////////////////////////////////////////////////////
// MATH
////////////////////////////////////////////////////////////////////////////////

function distance(a:any,b:any){

  const R = 6371000;

  const dLat =
    (b[0]-a[0]) *
    Math.PI/180;

  const dLng =
    (b[1]-a[1]) *
    Math.PI/180;

  const lat1 =
    a[0] * Math.PI/180;

  const lat2 =
    b[0] * Math.PI/180;

  const A =

    Math.sin(dLat/2) ** 2 +

    Math.cos(lat1) *

    Math.cos(lat2) *

    Math.sin(dLng/2) ** 2;

  const C =
    2 *
    Math.atan2(
      Math.sqrt(A),
      Math.sqrt(1-A)
    );

  return R * C;
}

////////////////////////////////////////////////////////////////////////////////
// ANGLE
////////////////////////////////////////////////////////////////////////////////

function getAngle(
  p1:any,
  p2:any
){

  const dy =
    p2[0] - p1[0];

  const dx =
    p2[1] - p1[1];

  const rad =
    Math.atan2(dy,dx);

  const deg =
    rad * 180 / Math.PI;

  return deg + 90;
}

////////////////////////////////////////////////////////////////////////////////
// ICON
////////////////////////////////////////////////////////////////////////////////

function createTruck(
  status:string="idle",
  angle:number=0
){

  const glow =

    status === "running"

      ? "#22c55e"

      : status === "done"

      ? "#9ca3af"

      : "#f59e0b";

  return L.divIcon({

    html: `
      <div style="
        width:64px;
        height:64px;
        display:flex;
        align-items:center;
        justify-content:center;
        transform: rotate(${angle}deg);
        transition: transform 0.2s linear;
      ">

        <img

          src="https://cdn-icons-png.flaticon.com/512/12178/12178010.png"

          style="
            width:54px;
            height:54px;
            object-fit:contain;

            filter:
              drop-shadow(0 0 12px ${glow})
              drop-shadow(0 0 18px ${glow});

            user-select:none;
            pointer-events:none;
          "
        />

      </div>
    `,

    className:"",

    iconSize:[64,64],

    iconAnchor:[32,32]
  });
}

////////////////////////////////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////////////////////////////////

export default function Routes(){

  const db = getDatabase();

  const [routes,setRoutes] =
    useState<any>({});

  const [paths,setPaths] =
    useState<any>({});

  const [vehicles,setVehicles] =
    useState<any>({});

  const [smooth,setSmooth] =
    useState<any>({});

  ////////////////////////////////////////////////////////////////////////////
  // FIREBASE
  ////////////////////////////////////////////////////////////////////////////

  useEffect(()=>{

    onValue(

      ref(db,"vehicles"),

      (snap)=>{

        setVehicles(
          snap.val() || {}
        );
      }
    );

    onValue(

      ref(db,"routes"),

      (snap)=>{

        setRoutes(
          snap.val() || {}
        );
      }
    );

  },[]);

  ////////////////////////////////////////////////////////////////////////////
  // LOAD GPX
  ////////////////////////////////////////////////////////////////////////////

  useEffect(()=>{

    ROUTES.forEach(async(key)=>{

      const data =
        await loadGPX(
          `/routes/${key}.gpx`
        );

      if(
        !data ||
        data.length===0
      ) return;

      let cumulative:number[]=[0];

      let total=0;

      for(
        let i=0;
        i<data.length-1;
        i++
      ){

        total += distance(
          data[i],
          data[i+1]
        );

        cumulative.push(total);
      }

      setPaths((prev:any)=>({

        ...prev,

        [key]:{

          points:data,

          cumulative,

          total
        }
      }));

    });

  },[]);

  ////////////////////////////////////////////////////////////////////////////
  // START
  ////////////////////////////////////////////////////////////////////////////

  const startRoute = async(
    key:string
  )=>{

    if(!paths[key]){

      alert("Route chưa load");

      return;
    }

    const route =
      paths[key].points;

    await update(

      ref(db,"vehicles/"+key),

      {

        percent:0,

        running:true,

        speed:0.05,

        position:route[0]
      }
    );

    await set(

      ref(db,"routes/"+key),

      {

        ...(routes[key] || {}),

        status:"running"
      }
    );

    const snap =
      await get(
        ref(db,"drivers")
      );

    const drivers =
      snap.val() || {};

    Object.values(drivers)

      .forEach((d:any)=>{

        if(d.route===key){

          update(

            ref(
              db,
              "drivers/"+d.phone
            ),

            {

              status:"online"
            }
          );
        }
      });
  };

  ////////////////////////////////////////////////////////////////////////////
  // STOP
  ////////////////////////////////////////////////////////////////////////////

  const stopRoute = async(
    key:string
  )=>{

    await update(

      ref(db,"vehicles/"+key),

      {

        running:false
      }
    );

    await set(

      ref(db,"routes/"+key),

      {

        ...(routes[key] || {}),

        status:"done"
      }
    );

    const snap =
      await get(
        ref(db,"drivers")
      );

    const drivers =
      snap.val() || {};

    Object.values(drivers)

      .forEach((d:any)=>{

        if(d.route===key){

          update(

            ref(
              db,
              "drivers/"+d.phone
            ),

            {

              status:"offline"
            }
          );
        }
      });
  };

  ////////////////////////////////////////////////////////////////////////////
  // ANIMATION
  ////////////////////////////////////////////////////////////////////////////

  useEffect(()=>{

    let raf:any;

    const animate = ()=>{

      setSmooth((prev:any)=>{

        const next:any = {};

        Object.keys(vehicles)

          .forEach((key)=>{

            const v =
              vehicles[key];

            const path =
              paths[key];

            if(!v || !path)
              return;

            const cumulative =
              path.cumulative;

            const route =
              path.points;

            const total =
              path.total;

            const percent =
              v.percent || 0;

            const targetDist =

              (percent / 100) *
              total;

            let i = cumulative

              .findIndex(
                (d:number)=>
                  d >= targetDist
              );

            if(i <= 0)
              i = 1;

            const prevDist =
              cumulative[i-1];

            const nextDist =
              cumulative[i];

            const t =

              (targetDist-prevDist)

              /

              (nextDist-prevDist || 1);

            const p1 =
              route[i-1];

            const p2 =
              route[i];

            //////////////////////////////////////////////////
            // POSITION
            //////////////////////////////////////////////////

            const targetPos = [

              p1[0] +
              (p2[0]-p1[0]) * t,

              p1[1] +
              (p2[1]-p1[1]) * t
            ];

            //////////////////////////////////////////////////
            // ANGLE
            //////////////////////////////////////////////////

            const angle =
              getAngle(p1,p2);

            //////////////////////////////////////////////////
            // SMOOTH
            //////////////////////////////////////////////////

            const old =
              prev[key]?.pos ||
              targetPos;

            const smoothPos = [

              old[0] +
              (targetPos[0]-old[0]) * 0.15,

              old[1] +
              (targetPos[1]-old[1]) * 0.15
            ];

            next[key] = {

              pos:smoothPos,

              angle
            };

          });

        return next;
      });

      raf =
        requestAnimationFrame(
          animate
        );
    };

    animate();

    return ()=>{

      cancelAnimationFrame(raf);
    };

  },[vehicles,paths]);

  ////////////////////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////////////////////

  return (

    <div className="
      flex
      h-full
      gap-5
      p-5
      bg-gradient-to-br
      from-slate-100
      via-gray-100
      to-slate-200
      rounded-[32px]
    ">

      {/* SIDEBAR */}

      <div className="
        w-80
        bg-white/70
        backdrop-blur-2xl
        rounded-[32px]
        shadow-2xl
        border
        p-5
        overflow-auto
      ">

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
              Route Control
            </h2>

            <p className="
              text-sm
              text-gray-500
            ">
              Smart delivery routes
            </p>

          </div>

          <div className="
            w-14
            h-14
            rounded-3xl
            bg-gradient-to-r
            from-blue-500
            to-indigo-500
            text-white
            flex
            items-center
            justify-center
          ">

            <Route size={28} />

          </div>

        </div>

        <div className="space-y-5">

          {ROUTES.map((key)=>{

            const status =
              routes[key]?.status ||
              "idle";

            return (

              <div

                key={key}

                className="
                  bg-white
                  rounded-3xl
                  p-5
                  shadow-lg
                  border
                "
              >

                <div className="
                  flex
                  justify-between
                  items-center
                  mb-4
                ">

                  <div className="
                    flex
                    items-center
                    gap-3
                  ">

                    <div className="
                      w-12
                      h-12
                      rounded-2xl
                      bg-blue-100
                      text-blue-600
                      flex
                      items-center
                      justify-center
                    ">

                      <Truck />

                    </div>

                    <div>

                      <h3 className="
                        font-bold
                        text-lg
                      ">
                        {key}
                      </h3>

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
                        status==="running"

                          ? `
                            bg-green-100
                            text-green-700
                          `

                          : status==="done"

                          ? `
                            bg-gray-200
                            text-gray-700
                          `

                          : `
                            bg-yellow-100
                            text-yellow-700
                          `
                      }
                    `}
                  >

                    {status}

                  </div>

                </div>

                <div className="
                  w-full
                  h-4
                  bg-gray-200
                  rounded-full
                  overflow-hidden
                  mb-5
                ">

                  <div

                    className="
                      h-4
                      rounded-full
                      bg-gradient-to-r
                      from-blue-500
                      to-indigo-500
                    "

                    style={{
                      width:
                        `${vehicles[key]?.percent || 0}%`
                    }}
                  />

                </div>

                <div className="
                  flex
                  gap-3
                ">

                  <button

                    onClick={()=>
                      startRoute(key)
                    }

                    className="
                      flex-1
                      py-3
                      rounded-2xl
                      bg-green-500
                      text-white
                      font-semibold
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >

                    <Play size={18} />

                    Start

                  </button>

                  <button

                    onClick={()=>
                      stopRoute(key)
                    }

                    className="
                      flex-1
                      py-3
                      rounded-2xl
                      bg-red-500
                      text-white
                      font-semibold
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >

                    <Square size={18} />

                    Stop

                  </button>

                </div>

              </div>
            );
          })}

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
      ">

        <MapContainer

          center={[10.78,106.68]}

          zoom={13}

          style={{
            height:"100%",
            width:"100%"
          }}
        >

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ROUTES */}

          {Object.entries(paths)

            .map(([key,r]:any)=>{

              if(
                !r?.points
              ) return null;

              return (

                <Polyline

                  key={key}

                  positions={r.points}

                  pathOptions={{

                    weight:5,

                    color:

                      key==="R1"

                        ? "#3b82f6"

                        : key==="R2"

                        ? "#22c55e"

                        : "#f59e0b"
                  }}
                />
              );
            })}

          {/* VEHICLES */}

          {Object.entries(vehicles)

            .map(([key,v]:any)=>{

              const pos =
                smooth[key]?.pos ||
                v.position;

              const angle =
                smooth[key]?.angle || 0;

              if(!pos)
                return null;

              return (

                <Marker

                  key={key}

                  position={pos}

                  icon={
                    createTruck(
                      routes[key]?.status,
                      angle
                    )
                  }
                >

                  <Popup>

                    <div className="
                      space-y-2
                    ">

                      <h2 className="
                        font-bold
                        text-lg
                      ">
                        🚚 {key}
                      </h2>

                      <p>
                        Progress:
                        {" "}
                        <b>
                          {Math.floor(
                            v.percent || 0
                          )}%
                        </b>
                      </p>

                      <p>
                        Rotation:
                        {" "}
                        <b>
                          {Math.floor(angle)}°
                        </b>
                      </p>

                    </div>

                  </Popup>

                </Marker>
              );
            })}

        </MapContainer>

      </div>

    </div>
  );
}