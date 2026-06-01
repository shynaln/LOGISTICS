    import { useNavigate } from "react-router-dom";
import {

  useEffect,

  useState

} from "react";

import {

  Mail,

  ShieldCheck,

  Truck,

  Package,

  Clock3,

  CheckCircle2,

  User,

  CalendarDays

} from "lucide-react";

import {

  listenAuth

} from "../services/auth";
import {
  getDatabase,
  ref,
  onValue
} from "firebase/database";
////////////////////////////////////////////////////////////////////////////////
// MY ACCOUNT
////////////////////////////////////////////////////////////////////////////////

export default function MyAccount() {

  ////////////////////////////////////////////////////
  // STATES
  ////////////////////////////////////////////////////

  const [user, setUser] =
    useState<any>(null);
const [stats,setStats] =
  useState({

    total:0,

    pending:0,

    running:0,

    completed:0
  });
  const [orders,setOrders] =
  useState<any[]>([]);
    const navigate =
  useNavigate();
  useEffect(() => {

  const unsubscribe =

    listenAuth(
      (data:any) => {

        setUser(data);
      }
    );

  return () => {

    if(unsubscribe)
      unsubscribe();
  };

}, []);
  ////////////////////////////////////////////////////
  // AUTH
  ////////////////////////////////////////////////////

useEffect(()=>{

  if(!user?.uid)
    return;

  const db =
    getDatabase();

  onValue(

    ref(db,"orders"),

    snapshot=>{

      const data =
        snapshot.val() || {};

      const myOrders =

        Object.values(data)

        .filter(

          (order:any)=>

            order.uid ===
            user.uid
        );
        setOrders(
  myOrders as any[]
);

      setStats({

        total:
          myOrders.length,

        pending:
          myOrders.filter(
            (o:any)=>
              o.status === "pending"
          ).length,

        running:
          myOrders.filter(
            (o:any)=>
              o.status === "running"
          ).length,

        completed:
          myOrders.filter(
            (o:any)=>
              o.status === "delivered"
          ).length
      });
    }
  );

},[user]);

  ////////////////////////////////////////////////////
  // LOADING
  ////////////////////////////////////////////////////

  if(!user){

    return (

      <div className="
        min-h-screen
        flex
        items-center
        justify-center
        text-2xl
        font-bold
        text-gray-500
      ">

        Loading...

      </div>
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
      via-white
      to-blue-100
      p-8
    ">

      <div className="
        max-w-7xl
        mx-auto
        space-y-8
      ">

        {/* HEADER */}

        <div className="
          flex
          justify-between
          items-center
        ">

          <div>

            <h1 className="
              text-5xl
              font-black
              text-gray-800
            ">

              My Account

            </h1>

            <p className="
              text-gray-500
              mt-3
              text-lg
            ">

              Manage your logistics profile

            </p>

          </div>

        </div>

        {/* PROFILE */}

        <div className="
          grid
          grid-cols-1 xl:grid-cols-3
          gap-8
        ">

          {/* LEFT */}

          <div className="
            col-span-1
            bg-white/80
            backdrop-blur-2xl
            rounded-[36px]
            shadow-2xl
            border
            p-8
          ">

            {/* AVATAR */}

            <div className="
              w-36
              h-36
              rounded-full
              bg-gradient-to-r
              from-blue-500
              to-indigo-500
              text-white
              flex
              items-center
              justify-center
              text-6xl
              font-black
              shadow-2xl
              mx-auto
            ">

              {
  user.name
    ?.split(" ")
    .map(
      (w:string)=>
        w[0]
    )
    .slice(0,2)
    .join("")
    .toUpperCase()
}

            </div>

            {/* NAME */}

            <div className="
              text-center
              mt-8
            ">

              <h2 className="
                text-3xl
                font-black
                text-gray-800
              ">

                {user.name}

              </h2>

              <p className="
                text-gray-500
                mt-2
              ">

                {user.email}

              </p>

            </div>

            {/* ROLE */}

            <div className="
              mt-8
              bg-blue-50
              rounded-3xl
              p-5
              text-center
            ">

              <div className="
                flex
                items-center
                justify-center
                gap-3
                text-blue-600
              ">

                <ShieldCheck />

                <span className="
                  font-bold
                ">

                  CUSTOMER ACCOUNT

                </span>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="
            col-span-2
            space-y-8
          ">

            {/* ACCOUNT INFO */}

            <div className="
              bg-white/80
              backdrop-blur-2xl
              rounded-[36px]
              shadow-2xl
              border
              p-8
            ">

              <h2 className="
                text-3xl
                font-black
                text-gray-800
                mb-8
              ">

                Account Information

              </h2>

              <div className="
                grid
                grid-cols-2
                gap-6
              ">

                {/* NAME */}

                <InfoCard
                  icon={User}
                  title="Full Name"
                  value={user.name}
                />

                {/* EMAIL */}

                <InfoCard
                  icon={Mail}
                  title="Email"
                  value={user.email}
                />

                {/* ROLE */}

                <InfoCard
                  icon={ShieldCheck}
                  title="Role"
                  value={user.role}
                />

                {/* CREATED */}

                <InfoCard
                  icon={CalendarDays}
                  title="Account Created"
                  value={
                    new Date(
                      user.createdAt
                    ).toLocaleDateString()
                  }
                />

              </div>

            </div>

            {/* STATS */}

            <div className="
              grid
              grid-cols-1 md:grid-cols-2 xl:grid-cols-4
              gap-6
            ">

              <StatCard
                icon={Package}
                title="Total Orders"
                value={stats.total}
                color="from-blue-500 to-indigo-500"
              />

              <StatCard
                icon={Clock3}
                title="Pending"
                value={stats.pending}
                color="from-orange-500 to-amber-500"
              />
            <StatCard
  icon={Truck}
  title="Running"
  value={stats.running}
  color="from-cyan-500 to-blue-500"
/>
              <StatCard
                icon={CheckCircle2}
                title="Completed"
                value={stats.completed}
                color="from-green-500 to-emerald-500"
              />

            </div>
            {/* MY ORDERS */}

{/* MY ORDERS */}

<div className="
  bg-white/80
  backdrop-blur-2xl
  rounded-[36px]
  shadow-2xl
  border
  p-8
">

  <h2 className="
    text-3xl
    font-black
    text-gray-800
    mb-6
  ">
    My Orders
  </h2>

  {
    orders.length === 0 && (

      <div className="
        text-center
        py-10
        text-gray-500
      ">

        No Orders Yet

      </div>
    )
  }

  {
    orders.map(

      (order:any,index:number)=>(

        <div

          key={index}

          className="
            flex
            justify-between
            items-center
            py-5
            border-b
          "
        >

          <div>

            <h3 className="
              text-xl
              font-black
              text-blue-600
            ">

              {
                order.orderCode
              }

            </h3>

            <p className="
              text-gray-500
              mt-1
            ">

              Status:
              {" "}

              {
                order.status
              }

            </p>

          </div>

          <button

            onClick={()=>

  navigate(
  `/customer/tracking/${encodeURIComponent(
    order.orderCode
  )}`
)
}

            className="
              px-5
              py-3
              rounded-2xl
              bg-blue-500
              text-white
              font-bold
            "
          >

            Track

          </button>

        </div>
      )
    )
  }

</div>

          </div>

        </div>

      </div>

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// INFO CARD
////////////////////////////////////////////////////////////////////////////////

function InfoCard({

  icon:Icon,

  title,

  value

}:any){

  return (

    <div className="
      bg-gray-50
      rounded-3xl
      p-6
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

          <Icon size={26} />

        </div>

        <div>

          <p className="
            text-sm
            text-gray-500
          ">

            {title}

          </p>

          <h2 className="
            text-lg
            font-bold
            text-gray-800
            mt-1
          ">

            {value}

          </h2>

        </div>

      </div>

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// STAT CARD
////////////////////////////////////////////////////////////////////////////////

function StatCard({

  icon:Icon,

  title,

  value,

  color

}:any){

  return (

    <div className={`
      bg-gradient-to-r
      ${color}
      rounded-[32px]
      p-8
      text-white
      shadow-2xl
    `}>

      <div className="
        flex
        justify-between
        items-center
      ">

        <div>

          <p className="
            opacity-80
          ">

            {title}

          </p>

          <h2 className="
            text-5xl
            font-black
            mt-4
          ">

            {value}

          </h2>

        </div>

        <Icon size={42} />

      </div>

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// ACTION CARD
////////////////////////////////////////////////////////////////////////////////

function ActionCard({

  icon:Icon,

  title,

  onClick

}:any){

  return (

    <button

      onClick={onClick}

      className="
        bg-gray-50
        rounded-3xl
        p-8
        hover:bg-blue-50
        hover:scale-[1.02]
        transition-all
        text-left
        w-full
      "
    >

      <div className="
        w-16
        h-16
        rounded-2xl
        bg-blue-100
        text-blue-600
        flex
        items-center
        justify-center
        mb-5
      ">

        <Icon size={32} />

      </div>

      <h2 className="
        text-xl
        font-bold
        text-gray-800
      ">

        {title}

      </h2>

    </button>
  );
}