import { useState, useEffect, useRef } from "react";

import { products } from "../data/products";

import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  update,
 remove
} from "firebase/database";

import {
  ShoppingCart,
  Truck,
  Package,
  CheckCircle2,
  Activity,
  Trash2,
  Plus,
  Minus,
  Boxes,
  Rocket
} from "lucide-react";

const TRUCKS = ["R1", "R2", "R3"];

export default function Orders() {

  const db = getDatabase();

  const [cart, setCart] =
    useState<any>({});

  const [orders, setOrders] =
    useState<any[]>([]);

  const [vehicles, setVehicles] =
    useState<any>({});

  const [selectedTruck, setSelectedTruck] =
    useState("R1");

  const [deliveredCount, setDeliveredCount] =
    useState(0);

  const [avgProgress, setAvgProgress] =
    useState(0);

  const dingRef =
    useRef<HTMLAudioElement | null>(null);

  const played =
    useRef<any>({});

  ////////////////////////////////////////////////////////////////////////////
  // FIREBASE
  ////////////////////////////////////////////////////////////////////////////

  useEffect(() => {

    onValue(

      ref(db, "orders"),

      (snap) => {

        const data =
          snap.val() || {};

        const arr =

          Object.entries(data)

            .map(([id, v]) => ({

              id,

              ...(v as any)

            }));

        setOrders(arr);

        setDeliveredCount(
          arr.length
        );
      }
    );

    onValue(

      ref(db, "vehicles"),

      (snap) => {

        setVehicles(
          snap.val() || {}
        );
      }
    );

  }, []);

  ////////////////////////////////////////////////////////////////////////////
  // UPDATE
  ////////////////////////////////////////////////////////////////////////////

  useEffect(() => {

    Object.entries(vehicles)

      .forEach(

        ([truck, v]: any) => {

          const percent =

            Math.floor(
              v.percent || 0
            );

          orders.forEach(async (o) => {

            if (
              o.truck !== truck
            ) return;

            const status =

              percent >= 100

                ? "delivered"

                : percent > 0

                ? "running"

                : "pending";

            await update(

              ref(
                db,
                "orders/" + o.id
              ),

              {

                progress: percent,

                status
              }
            );

            //////////////////////////////////////////////////
            // SOUND
            //////////////////////////////////////////////////

            if (

              percent >= 100 &&

              !played.current[o.id]

            ) {

              played.current[o.id] = true;

              dingRef.current?.play();
            }

          });

        }
      );

    //////////////////////////////////////////////////////
    // AVG
    //////////////////////////////////////////////////////

    if (orders.length) {

      const total =

        orders.reduce(

          (sum, o) =>

            sum + (o.progress || 0),

          0
        );

      const avg =

        Math.floor(
          total / orders.length
        );

      setAvgProgress(avg);

      ////////////////////////////////////////////////////
      // PUSH FIREBASE
      ////////////////////////////////////////////////////

      update(

        ref(db, "dashboard"),

        {

          delivered:
            deliveredCount,

          currentVehicle:
            avg
        }
      );
    }

  }, [vehicles, orders, deliveredCount]);

  ////////////////////////////////////////////////////////////////////////////
  // ADD
  ////////////////////////////////////////////////////////////////////////////

  const add = (id:string) => {

    setCart((p:any)=>({

      ...p,

      [id]:
        (p[id] || 0) + 1
    }));
  };

  ////////////////////////////////////////////////////////////////////////////
  // REMOVE
  ////////////////////////////////////////////////////////////////////////////

  const removeItem = (id:string) => {

    setCart((p:any)=>({

      ...p,

      [id]:

        Math.max(
          (p[id] || 0) - 1,
          0
        )
    }));
  };

  ////////////////////////////////////////////////////////////////////////////
  // ORDER
  ////////////////////////////////////////////////////////////////////////////

  const placeOrder = async () => {

    if (
      !Object.keys(cart).length
    ) return;

    const newRef =

      push(
        ref(db, "orders")
      );

    await set(

      newRef,

      {

        items:

  Object.entries(cart)

    .map(([id,q]:any)=>{

      const product =

        products.find(
          p=>p.id===id
        );

      return {

        id,

        name:
          product?.name,

        quantity:q,

        price:
          product?.price || 0,

        total:

          (
            product?.price || 0
          ) * q
      };

    }),

totalItems,

totalPrice,

        truck:
          selectedTruck,

        progress: 0,

        status:
          "pending",

        createdAt:
          Date.now()
      }
    );

    setCart({});
  };

  ////////////////////////////////////////////////////////////////////////////
  // DELETE
  ////////////////////////////////////////////////////////////////////////////

  const deleteOrder = async (
    id:string
  ) => {

    await remove(

      ref(
        db,
        "orders/" + id
      )
    );
  };

  ////////////////////////////////////////////////////////////////////////////
  // TOTAL
  ////////////////////////////////////////////////////////////////////////////

  const totalItems =

    (Object.values(cart) as number[])

      .reduce(
        (a,b)=>a+b,
        0
      );
  const totalPrice =

  Object.entries(cart)

    .reduce(

      (sum,[id,q]:any)=>{

        const product =

          products.find(
            p=>p.id===id
          );

        return (

          sum +

          (
            (product?.price || 0)

            * q
          )
        );

      },

      0
    );
  ////////////////////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////////////////////

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
            mt-1
          ">
            Smart logistics ordering system
          </p>

        </div>

        <div className="
          flex
          gap-5
        ">

          <TopCard
            title="Delivered"
            value={deliveredCount}
            icon={<CheckCircle2 />}
            color="green"
          />

          <TopCard
            title="Vehicle Progress"
            value={`${avgProgress}%`}
            icon={<Activity />}
            color="blue"
          />

        </div>

      </div>

      {/* MAIN */}

      <div className="
        grid
        grid-cols-3
        gap-6
      ">

        {/* PRODUCTS */}

        <div className="
          col-span-2
          grid
          grid-cols-3
          gap-5
        ">

          {products.map((p)=>(

            <div

              key={p.id}

              className="
                bg-white/70
                backdrop-blur-2xl
                rounded-[32px]
                shadow-2xl
                border
                p-5
                hover:scale-[1.02]
                transition-all
                duration-300
                relative
                overflow-hidden
              "
            >

              <div className={`
                absolute
                top-0
                left-0
                w-full
                h-1

                ${
                  p.risk==="danger"

                    ? `
                      bg-gradient-to-r
                      from-red-500
                      to-pink-500
                    `

                    : p.risk==="high"

                    ? `
                      bg-gradient-to-r
                      from-orange-500
                      to-red-500
                    `

                    : `
                      bg-gradient-to-r
                      from-blue-500
                      to-indigo-500
                    `
                }
              `} />

              <div className="
                flex
                justify-center
                mb-4
              ">

                <img

                  src={p.img}

                  className="
                    h-28
                    object-contain
                    drop-shadow-lg
                  "
                />

              </div>

              <div className="
                text-center
              ">

                <h2 className="
                  font-bold
                  text-gray-800
                  text-lg
                ">
                  {p.name}
                </h2>
                <h3 className="
  text-2xl
  font-bold
  text-green-600
  mt-3
">
  {Number(p.price || 0).toLocaleString()}đ
</h3>
                <p className="
                  text-sm
                  text-gray-500
                  mt-1
                ">
                  Temp: {p.temp}
                </p>

              </div>

              <div className="
                flex
                justify-center
                items-center
                gap-4
                mt-5
              ">

                <button

                  onClick={()=>
                    removeItem(p.id)
                  }

                  className="
                    w-10
                    h-10
                    rounded-2xl
                    bg-gray-100
                    hover:bg-gray-200
                    flex
                    items-center
                    justify-center
                    transition-all
                  "
                >

                  <Minus size={18} />

                </button>

                <div className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-blue-500
                  text-white
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-lg
                  shadow-lg
                ">

                  {cart[p.id] || 0}

                </div>

                <button

                  onClick={()=>
                    add(p.id)
                  }

                  className="
                    w-10
                    h-10
                    rounded-2xl
                    bg-blue-500
                    hover:bg-blue-600
                    text-white
                    flex
                    items-center
                    justify-center
                    transition-all
                    shadow-lg
                  "
                >

                  <Plus size={18} />

                </button>

              </div>

            </div>

          ))}

        </div>

        {/* RIGHT */}

        <div className="
          flex
          flex-col
          gap-6
        ">

          {/* CART */}

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
              mb-6
            ">

              <div>

                <h2 className="
                  text-2xl
                  font-bold
                  text-gray-800
                ">
                  Cart
                </h2>

                <p className="
                  text-sm
                  text-gray-500
                ">
                  Current shipment
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
                shadow-lg
              ">

                <ShoppingCart />

              </div>

            </div>

            <div className="
              space-y-3
              mb-6
            ">

              {Object.entries(cart)

                .map(([id,q]:any)=>

                  q > 0 && (

                    <div

                      key={id}

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

                      <div className="
                        flex
                        items-center
                        gap-3
                      ">

                        <div className="
                          w-10
                          h-10
                          rounded-2xl
                          bg-blue-100
                          text-blue-600
                          flex
                          items-center
                          justify-center
                        ">

                          <Package size={18} />

                        </div>

                        <div>

  <span className="
    font-medium
  ">
    {

      products.find(
        p=>p.id===id
      )?.name

    }
  </span>

  <p className="
    text-sm
    text-green-600
    font-semibold
  ">

    {

      (
        (
          products.find(
            p=>p.id===id
          )?.price || 0
        ) * q

      ).toLocaleString()

    }đ

  </p>

</div>
                      </div>

                      <div className="
                        px-3
                        py-1
                        rounded-full
                        bg-blue-500
                        text-white
                        text-sm
                        font-bold
                      ">

                        x{q}

                      </div>

                    </div>

                  )
                )
              }

            </div>

            <div className="
              bg-gradient-to-r
              from-blue-500
              to-indigo-500
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
                    Total Items
                  </p>

                  <h2 className="
                    text-3xl
                    font-bold
                    mt-1
                  ">
                    {totalItems}
                  </h2>
                  <div className="
  mt-4
  pt-4
  border-t
  border-white/20
">

  <p className="
    text-sm
    opacity-80
  ">
    Total Price
  </p>

  <h2 className="
    text-3xl
    font-bold
    mt-1
  ">
    {totalPrice.toLocaleString()}đ
  </h2>

</div>
                </div>

                <Boxes size={42} />

              </div>

            </div>

            <div className="mb-5">

              <p className="
                text-sm
                font-medium
                text-gray-600
                mb-3
              ">
                🚚 Select Vehicle
              </p>

              <div className="
                flex
                gap-3
              ">

                {TRUCKS.map((t)=>(

                  <button

                    key={t}

                    onClick={()=>
                      setSelectedTruck(t)
                    }

                    className={`
                      flex-1
                      py-3
                      rounded-2xl
                      font-semibold
                      transition-all

                      ${
                        selectedTruck===t

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

                    {t}

                  </button>

                ))}

              </div>

            </div>

            <button

              onClick={placeOrder}

              className="
                w-full
                py-4
                rounded-3xl
                bg-gradient-to-r
                from-green-500
                to-emerald-500
                text-white
                font-bold
                shadow-xl
                hover:scale-[1.02]
                transition-all
                flex
                items-center
                justify-center
                gap-3
              "
            >

              <Rocket size={20} />

              Place Order

            </button>

          </div>

          {/* TRACKING */}

          <div className="
            bg-white/70
            backdrop-blur-2xl
            rounded-[32px]
            shadow-2xl
            border
            p-6
            flex-1
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
                  Tracking
                </h2>

                <p className="
                  text-sm
                  text-gray-500
                ">
                  Live delivery status
                </p>

              </div>

              <div className="
                w-14
                h-14
                rounded-3xl
                bg-gradient-to-r
                from-purple-500
                to-violet-500
                text-white
                flex
                items-center
                justify-center
              ">

                <Truck />

              </div>

            </div>

            <div className="
              space-y-5
              max-h-[500px]
              overflow-auto
            ">

              {orders.map((o)=>(

                <div

                  key={o.id}

                  className="
                    bg-gray-50
                    rounded-3xl
                    p-5
                  "
                >

                  <div className="
                    flex
                    justify-between
                    items-center
                    mb-3
                  ">

                    <div>

                      <h2 className="
                        font-bold
                        text-gray-800
                      ">
                        {o.id}
                      </h2>

                      <p className="
                        text-sm
                        text-gray-500
                      ">
                        Vehicle:
                        {" "}
                        {o.truck}
                      </p>
                    <div className="
  mt-4
  space-y-2
">

  {Array.isArray(o.items) &&

  o.items.map((item:any)=>(


    <div

      key={item.id}

      className="
        flex
        justify-between
        items-center
        bg-white
        rounded-2xl
        px-4
        py-3
      "
    >

      <div>

        <h3 className="
          font-semibold
        ">
          {item.name}
        </h3>

        <p className="
          text-sm
          text-gray-500
        ">
          {item.quantity}
          {" x "}
          {Number(item.price || 0).toLocaleString()}đ
        </p>

      </div>

      <div className="
        font-bold
        text-green-600
      ">

       {Number(item.total || 0).toLocaleString()}đ

      </div>

    </div>

  ))
  }

  <div className="
    flex
    justify-between
    items-center
    mt-4
    pt-4
    border-t
  ">

    <span className="
      font-semibold
      text-gray-600
    ">
      Total
    </span>

    <span className="
      text-2xl
      font-bold
      text-green-600
    ">

      {(o.totalPrice || 0)
        .toLocaleString()}đ

    </span>

  </div>

</div>
                    </div>

                    <div className="
                      flex
                      items-center
                      gap-3
                    ">

                      <div
                        className={`
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-semibold

                          ${
                            o.status==="delivered"

                              ? `
                                bg-green-100
                                text-green-700
                              `

                              : o.status==="running"

                              ? `
                                bg-yellow-100
                                text-yellow-700
                              `

                              : `
                                bg-gray-200
                                text-gray-700
                              `
                          }
                        `}
                      >

                        {o.status}

                      </div>

                      <button

                        onClick={()=>
                          deleteOrder(o.id)
                        }

                        className="
                          w-10
                          h-10
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

                        <Trash2 size={18} />

                      </button>

                    </div>

                  </div>

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
                      {o.progress || 0}%
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
                          `${o.progress || 0}%`
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

      <audio
        ref={dingRef}
        src="/ding.mp3"
      />

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

    green:
      "from-green-500 to-emerald-500",

    blue:
      "from-blue-500 to-indigo-500"
  };

  return (

    <div className="
      bg-white/70
      backdrop-blur-2xl
      rounded-[28px]
      shadow-2xl
      border
      px-6
      py-5
      min-w-[220px]
    ">

      <div className="
        flex
        justify-between
        items-center
      ">

        <div>

          <p className="
            text-sm
            text-gray-500
          ">
            {title}
          </p>

          <h2 className="
            text-3xl
            font-bold
            text-gray-800
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

          {icon}

        </div>

      </div>

    </div>
  );
}