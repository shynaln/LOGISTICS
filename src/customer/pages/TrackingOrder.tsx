
import {
  useState,
  useEffect
} from "react";

import {
  useParams
} from "react-router-dom";
import MapView from "../../components/MapView";
import {
  getDatabase,
  ref,
  onValue
} from "firebase/database";

import {
  Search,
  Truck,
  Package,
  User,
  Phone,
  MapPin
} from "lucide-react";

export default function TrackingOrder() {
  const { orderCode } =
  useParams();
  const [orderId, setOrderId] =
    useState("");

  const [order, setOrder] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);
  const [vehicle, setVehicle] =
  useState<any>(null);
  ////////////////////////////////////////////////////
  // SEARCH ORDER
  ////////////////////////////////////////////////////

 
function searchOrder(
  code?: string
) {

  const searchCode =
    code || orderId;

  if (!searchCode) {

    alert("Please enter Order Code");

    return;
  }

  setLoading(true);

  const db =
    getDatabase();

  onValue(

    ref(db, "orders"),

    (snapshot) => {

      const data =
        snapshot.val() || {};

      const found =

        Object.entries(data)

          .find(

            ([, value]: any) =>

              value.orderCode ===
              searchCode
          );

      if (!found) {

        setOrder(null);

        setVehicle(null);

        alert("Order not found");

        setLoading(false);

        return;
      }

      const [

        firebaseId,

        orderData

      ] = found as any;

      setOrder({

        id: firebaseId,

        ...orderData
      });

      if (
        orderData.vehicle &&
        orderData.vehicle !== ""
      ) {

        onValue(

          ref(
            db,
            `vehicles/${orderData.vehicle}`
          ),

          (vehicleSnap)=>{

            if(vehicleSnap.exists()){

              const v =
                vehicleSnap.val();

              setVehicle({

                id:
                  orderData.vehicle,

                driver:
                  v.driver,

                running:
                  Number(
                    v.running || 0
                  ),

                progress:
                  Number(
                    v.percent || 0
                  ),

                route:
                  `/routes/${orderData.vehicle}.gpx`
              });
            }
          }
        );
      }

      setLoading(false);
    }
  );
}
useEffect(() => {

  if(orderCode){

    setOrderId(
      orderCode
    );

    searchOrder(
      orderCode
    );
  }

}, [orderCode]);


  ////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////

  return (

    <div className="
      min-h-screen
      bg-gradient-to-br
      from-slate-100
      via-white
      to-blue-100
      p-8
    ">

      <div className="
        max-w-4xl
        mx-auto
      ">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="
            text-5xl
            font-black
            text-gray-800
          ">
            Track Order
          </h1>

          <p className="
            text-gray-500
            mt-3
          ">
            Realtime delivery tracking
          </p>

        </div>

        {/* SEARCH */}

        <div className="
          bg-white
          rounded-[32px]
          shadow-xl
          p-6
          mb-8
        ">

          <div className="
            flex
            gap-4
          ">

            <input

              value={orderId}

              onChange={(e)=>
                setOrderId(
                  e.target.value
                )
              }

              placeholder="Enter Order ID"

              className="
                flex-1
                border
                rounded-2xl
                px-5
                py-4
                outline-none
              "
            />

            <button

              onClick={() => searchOrder()}

              className="
                px-8
                rounded-2xl
                bg-blue-500
                text-white
                font-bold
                flex
                items-center
                gap-3
              "
            >

              <Search size={18} />

              SEARCH

            </button>

          </div>

        </div>

        {/* RESULT */}

        {

          loading && (

            <div className="
              bg-white
              rounded-3xl
              p-8
              shadow-xl
            ">
              Loading...
            </div>
          )
        }

        {

          order && (

            <div className="
              bg-white
              rounded-[36px]
              shadow-2xl
              p-8
            ">

              {/* CUSTOMER */}

              <div className="
                grid
                md:grid-cols-2
                gap-6
                mb-8
              ">

                <InfoCard
                  icon={<User />}
                  label="Customer"
                  value={
                    order.customerName
                  }
                />

                <InfoCard
                  icon={<Phone />}
                  label="Phone"
                  value={
                    order.customerPhone
                  }
                />

                <InfoCard
                  icon={<MapPin />}
                  label="Address"
                  value={
                    order.customerAddress
                  }
                />

                {
                    vehicle && (

                        <InfoCard
                        icon={<Truck />}
                        label="Driver"
                        value={
                            vehicle.driver ||
                            "-"
                        }
                        />
                    )
                    }
                

              </div>

              {/* STATUS */}

              <div className="
                flex
                justify-between
                items-center
                mb-6
              ">

                <div>

                  <p className="
                    text-gray-500
                  ">
                    Status
                  </p>

                  <h2
  className={`
    text-3xl
    font-black

    ${
      order.status === "pending"

        ? "text-yellow-500"

        : order.status === "running"

        ? "text-blue-500"

        : "text-green-600"
    }
  `}
>
{
  order.status === "pending"

    ? "⏳ Waiting"

    : order.status === "running"

    ? "🚚 Delivering"

    : "✅ Delivered"
}
</h2>

                </div>

                <Package
                  size={48}
                />

              </div>

              {/* PROGRESS */}

              <div>

                <div className="
                  flex
                  justify-between
                  mb-2
                ">

                  <span>
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
                  h-5
                  bg-gray-200
                  rounded-full
                  overflow-hidden
                ">

                  <div

                    className="
                      h-5
                      bg-gradient-to-r
                      from-blue-500
                      to-indigo-500
                      transition-all
                      duration-700
                    "

                    style={{
                      width:
                        `${Number(
  order.progress || 0
).toFixed(2)}%`
                    }}
                  />

                </div>

              </div>
              
{
  vehicle && (

    <div
      className="
        mt-8
        rounded-[32px]
        overflow-hidden
        border
        shadow-2xl
      "
    >

      <div
        className="
          px-6
          py-4
          bg-white
          border-b
        "
      >

        <h2
          className="
            text-xl
            font-bold
          "
        >
          🚚 Live Vehicle Tracking
        </h2>

        <p
          className="
            text-gray-500
            mt-1
          "
        >
          Vehicle:
          {" "}
          {order.vehicle}
        </p>

        <p
          className="
            text-gray-500
          "
        >
          Driver:
          {" "}
          {vehicle.driver}
        </p>

      </div>

      <div
        style={{
          height:"550px"
        }}
      >

        <MapView

          center={[
            10.78,
            106.68
          ]}

          vehicles={[
            vehicle
          ]}

        />

      </div>

    </div>
  )
}

{
  Array.isArray(
    order.items
  ) && (

    <div
      className="
        mt-8
        bg-gray-50
        rounded-[32px]
        p-6
      "
    >

      <h2
        className="
          text-2xl
          font-bold
          mb-5
        "
      >
        📦 Order Items
      </h2>

      {

        order.items.map(

          (
            item:any,
            index:number
          )=>(

            <div

              key={index}

              className="
                flex
                justify-between
                py-4
                border-b
              "
            >

              <div>

                <h3
                  className="
                    font-semibold
                  "
                >
                  {
                    item.name
                  }
                </h3>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Quantity:
                  {" "}
                  {
                    item.quantity
                  }
                </p>

              </div>

              <div
                className="
                  text-right
                "
              >

                <div
                  className="
                    font-bold
                    text-green-600
                  "
                >
                  {
                    Number(
                      item.price || 0
                    ).toLocaleString()
                  }đ
                </div>

              </div>

            </div>
          )
        )
      }

      <div
  className="
    mt-5
    text-right
    text-2xl
    font-black
    text-green-600
    whitespace-nowrap
  "
>
        Total:
        {" "}
        {
          Number(
            order.totalPrice || 0
          ).toLocaleString()
        }đ
      </div>

    </div>
  )
}


            </div>
          )
        }

      </div>

    </div>
  );
}

////////////////////////////////////////////////////
// INFO CARD
////////////////////////////////////////////////////

function InfoCard({

  icon,

  label,

  value

}:any){

  return (

    <div className="
      bg-gray-50
      rounded-3xl
      p-5
    ">

      <div className="
        flex
        items-center
        gap-3
        mb-3
      ">

        {icon}

        <span className="
          text-gray-500
        ">
          {label}
        </span>

      </div>

      <h2 className="
        font-bold
        text-gray-800
      ">
        {value || "-"}
      </h2>

    </div>
  );
}
