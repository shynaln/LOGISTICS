
import {

  useEffect,

  useState

} from "react";

import {

  getDatabase,

  ref,

  onValue,

  update,

  remove

} from "firebase/database";

import {

  Package,

  User,

  Truck,

  Clock3,

  CheckCircle2,

  Activity,

  Trash2,

  MapPinned

} from "lucide-react";

////////////////////////////////////////////////////////////////////////////////
// VEHICLES
////////////////////////////////////////////////////////////////////////////////

const VEHICLES = [

  "R1",

  "R2",

  "R3"
];

////////////////////////////////////////////////////////////////////////////////
// ORDERS
////////////////////////////////////////////////////////////////////////////////

export default function Orders() {

  ////////////////////////////////////////////////////
  // FIREBASE
  ////////////////////////////////////////////////////

  const db =
    getDatabase();

  ////////////////////////////////////////////////////
  // STATES
  ////////////////////////////////////////////////////

  const [orders, setOrders] =
    useState<any[]>([]);

  const [vehicles, setVehicles] =
    useState<any>({});

  const [stats, setStats] =
    useState({

      total:0,

      pending:0,

      running:0,

      delivered:0
    });

  ////////////////////////////////////////////////////
  // FIREBASE LISTENER
  ////////////////////////////////////////////////////

  useEffect(()=>{

    //////////////////////////////////////////////////
    // ORDERS
    //////////////////////////////////////////////////

    onValue(

      ref(db, "orders"),

      (snapshot)=>{

        const data =
          snapshot.val() || {};

        const arr =

          Object.entries(data)

            .map(([id, value])=>({

              id,

              ...(value as any)
            }))

            .reverse();

        setOrders(arr);

        //////////////////////////////////////////////////
        // STATS
        //////////////////////////////////////////////////

        setStats({

          total:
            arr.length,

          pending:

            arr.filter(
              (o:any)=>
                o.status === "pending"
            ).length,

          running:

            arr.filter(
              (o:any)=>
                o.status === "running"
            ).length,

          delivered:

            arr.filter(
              (o:any)=>
                o.status === "delivered"
            ).length
        });
      }
    );

    //////////////////////////////////////////////////
    // VEHICLES
    //////////////////////////////////////////////////

    onValue(

      ref(db, "vehicles"),

      (snapshot)=>{

        setVehicles(
          snapshot.val() || {}
        );
      }
    );

  },[]);

  ////////////////////////////////////////////////////
  // AUTO UPDATE STATUS
  ////////////////////////////////////////////////////

  useEffect(()=>{

    orders.forEach(async(order)=>{

      if(!order.vehicle)
        return;

      const vehicle =

        vehicles?.[order.vehicle];

      if(!vehicle)
        return;

      //////////////////////////////////////////////////
      // RUNNING
      //////////////////////////////////////////////////

      const running = Number(
        vehicle.running || 0
      );

      //////////////////////////////////////////////////
      // STATUS
      //////////////////////////////////////////////////

      let status =
        "pending";

      if(running === 1){

        status =
          "running";
      }

      //////////////////////////////////////////////////
      // DELIVERED
      //////////////////////////////////////////////////

      if(
        Number(vehicle.percent || 0)
        >= 100
      ){

        status =
          "delivered";
      }

      //////////////////////////////////////////////////
      // UPDATE
      //////////////////////////////////////////////////

const vehicleProgress =
  Number(vehicle.percent || 0);

const orderProgress =
  Number(order.progress || 0);

if (
  order.status !== status ||
  orderProgress !== vehicleProgress
) {

  await update(
    ref(
      db,
      `orders/${order.id}`
    ),
    {
      status,
      progress:
      Number(
        vehicleProgress.toFixed(2)
      )
    }
  );
}
    });

  }, [vehicles, orders]);

  ////////////////////////////////////////////////////
  // ASSIGN VEHICLE
  ////////////////////////////////////////////////////

  async function assignVehicle(

    orderId:string,

    vehicle:string

  ){

    await update(

      ref(
        db,
        `orders/${orderId}`
      ),

      {

        vehicle,

        status:"pending"
      }
    );
  }

  ////////////////////////////////////////////////////
  // DELETE
  ////////////////////////////////////////////////////

  async function deleteOrder(

    id:string

  ){

    await remove(

      ref(
        db,
        `orders/${id}`
      )
    );
  }

  ////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////

  return (

    <div className="
      min-h-screen
      bg-gradient-to-br
      from-slate-100
      via-gray-100
      to-slate-200
      p-6
    ">

      {/* HEADER */}

      <div className="
        flex
        justify-between
        items-center
        mb-8
      ">

        <div>

          <h1 className="
            text-4xl
            font-bold
            text-gray-800
          ">

            Orders Center

          </h1>

          <p className="
            text-gray-500
            mt-2
          ">

            Smart logistics management

          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="
        grid
        grid-cols-4
        gap-5
        mb-8
      ">

        <TopCard
          title="Total Orders"
          value={stats.total}
          icon={<Package />}
          color="blue"
        />

        <TopCard
          title="Pending"
          value={stats.pending}
          icon={<Clock3 />}
          color="orange"
        />

        <TopCard
          title="Running"
          value={stats.running}
          icon={<Activity />}
          color="purple"
        />

        <TopCard
          title="Delivered"
          value={stats.delivered}
          icon={<CheckCircle2 />}
          color="green"
        />

      </div>

      {/* ORDERS */}

      <div className="
        grid
        grid-cols-2
        gap-6
      ">

        {

          orders.map((order:any)=>(

            <div

              key={order.id}

              className="
                bg-white/70
                backdrop-blur-2xl
                rounded-[36px]
                shadow-2xl
                border
                p-6
              "
            >

              {/* TOP */}

              <div className="
                flex
                justify-between
                items-start
                mb-5
              ">

                <div>

                  <h2 className="
  text-2xl
  font-black
  text-blue-600
">

  {
    order.orderCode ||
    order.id
  }

</h2>

                  <p className="
                    text-gray-500
                    mt-1
                  ">

                    Customer Order

                  </p>

                </div>

                <button

                  onClick={()=>
                    deleteOrder(order.id)
                  }

                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-red-100
                    text-red-500
                    hover:bg-red-500
                    hover:text-white
                    flex
                    items-center
                    justify-center
                    transition-all
                  "
                >

                  <Trash2 />

                </button>

              </div>

              {/* CUSTOMER */}

              <div className="
                bg-gray-50
                rounded-3xl
                p-5
                mb-5
              ">

                <div className="
                  flex
                  items-center
                  gap-4
                ">

                  <div className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-blue-100
                    text-blue-600
                    flex
                    items-center
                    justify-center
                  ">

                    <User />

                  </div>

                  <div>

                    <h2 className="
                      font-bold
                      text-gray-800
                    ">
                      {
                        order.customerName
                        || "Unknown"
                      }
                    </h2>

                    <p className="
                      text-sm
                      text-gray-500
                    ">
                      📞 {order.customerPhone || "-"}
                    </p>

                    <p className="
                      text-sm
                      text-gray-500
                    ">
                      📍 {order.customerAddress || "-"}
                    </p>

                    <p className="
                      text-sm
                      text-gray-500
                    ">
                      📝 {order.customerNote || "-"}
                    </p>

                  </div>

                </div>

              </div>

              {/* ITEMS */}

              <div className="
                space-y-3
                mb-5
              ">

                {

                  Array.isArray(order.items)

                  &&

                  order.items.map((item:any)=>(

                    <div

                      key={item.id}

                      className="
                        flex
                        justify-between
                        items-center
                        bg-gray-50
                        rounded-2xl
                        px-4
                        py-3
                      "
                    >

                      <div>

                        <h2 className="
                          font-semibold
                          text-gray-800
                        ">

                          {item.name}

                        </h2>

                        <p className="
                          text-sm
                          text-gray-500
                        ">

                          {item.quantity}
                          {" x "}
                          {
                          (Number(item.price || 0) *
                          Number(item.quantity || 0)
                          ).toLocaleString()
                          }đ
                        </p>

                      </div>

                      <div className="
                        font-bold
                        text-green-600
                        text-xl
                      ">

                        {Number(
                          item.total || 0
                        ).toLocaleString()}đ

                      </div>

                    </div>
                  ))
                }

              </div>

              {/* TOTAL */}

              <div className="
                bg-gradient-to-r
                from-green-500
                to-emerald-500
                text-white
                rounded-3xl
                p-5
                mb-5
              ">

                <div className="
                  flex
                  justify-between
                  items-center
                ">

                  <div>

                    <p className="
                      text-sm
                      opacity-80
                    ">

                      Total Price

                    </p>

                    <h2 className="
                      text-4xl
                      font-black
                      mt-2
                    ">

                      {Number(
                        order.totalPrice || 0
                      ).toLocaleString()}đ

                    </h2>

                  </div>

                  <Package size={42} />

                </div>

              </div>

              {/* ASSIGN VEHICLE */}

              <div className="mb-5">

                <p className="
                  text-sm
                  font-bold
                  text-gray-600
                  mb-3
                ">

                  🚚 Assign Vehicle

                </p>

                <div className="
                  flex
                  gap-3
                ">

                  {

                    VEHICLES.map((vehicle)=>(

                      <button

                        key={vehicle}

                        onClick={()=>

                          assignVehicle(

                            order.id,

                            vehicle
                          )
                        }

                        className={`
                          flex-1
                          py-3
                          rounded-2xl
                          font-bold
                          transition-all

                          ${
                            order.vehicle === vehicle

                              ? `
                                bg-gradient-to-r
                                from-blue-500
                                to-indigo-500
                                text-white
                                shadow-xl
                              `

                              : `
                                bg-gray-100
                                text-gray-600
                              `
                          }
                        `}
                      >

                        {vehicle}

                      </button>
                    ))
                  }

                </div>

              </div>

              {/* STATUS */}

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

                  <MapPinned />

                  <span className="
                    font-semibold
                    text-gray-700
                  ">

                    Vehicle:
                    {" "}
                    {
                      order.vehicle
                      || "Not Assigned"
                    }

                  </span>

                </div>

                <div className={`
                  px-4
                  py-2
                  rounded-full
                  text-sm
                  font-bold

                  ${
                    order.status === "delivered"

                      ? `
                        bg-green-100
                        text-green-700
                      `

                      : order.status === "running"

                      ? `
                        bg-yellow-100
                        text-yellow-700
                      `

                      : `
                        bg-gray-200
                        text-gray-700
                      `
                  }
                `}>

                  {order.status}

                </div>

              </div>

              {/* PROGRESS */}

              <div>

                <div className="
                  flex
                  justify-between
                  text-sm
                  mb-2
                ">

                  <span className="
                    text-gray-500
                  ">

                    Delivery Progress

                  </span>

                  <span className="
                    font-bold
                    text-blue-600
                  ">

                    {
                      order.progress || 0
                    }%

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
                        `${Number(order.progress || 0).toFixed(2).replace(/\.00$/, "")}%`
                    }}
                  />

                </div>

              </div>

            </div>
          ))
        }

      </div>

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// TOP CARD
////////////////////////////////////////////////////////////////////////////////

function TopCard({

  title,

  value,

  icon,

  color

}:any){

  const colors:any = {

    blue:
      "from-blue-500 to-indigo-500",

    orange:
      "from-orange-500 to-red-500",

    purple:
      "from-purple-500 to-violet-500",

    green:
      "from-green-500 to-emerald-500"
  };

  return (

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
      ">

        <div>

          <p className="
            text-gray-500
            text-sm
          ">

            {title}

          </p>

          <h2 className="
            text-4xl
            font-black
            text-gray-800
            mt-2
          ">

            {value}

          </h2>

        </div>

        <div className={`
          w-16
          h-16
          rounded-3xl
          bg-gradient-to-r
          ${colors[color]}
          text-white
          flex
          items-center
          justify-center
          shadow-xl
        `}>

          {icon}

        </div>

      </div>

    </div>
  );
}

