import {
  getDatabase,
  ref,
  onValue
} from "firebase/database";
import {

  Routes,

  Route,

  Link,

  Navigate,

  useLocation,

  useNavigate

} from "react-router-dom";

import {

  Truck,

  ShoppingCart,

  Package,

  MapPinned,

  User,

  LogOut,

  ClipboardList,

  ChevronDown

} from "lucide-react";

import {

  useEffect,

  useState

} from "react";

import Login from "./pages/Login";

import Register from "./pages/Register";

import Shop from "./pages/Shop";

import Checkout from "./pages/Checkout";

import TrackingOrder from "./pages/TrackingOrder";

import MyAccount from "./pages/MyAccount";

import {

  listenAuth,

  logoutUser

} from "./services/auth";

////////////////////////////////////////////////////////////////////////////////
// ORDER HISTORY
////////////////////////////////////////////////////////////////////////////////

function OrderHistory(){

  const [user,setUser] =
    useState<any>(null);

  const [orders,setOrders] =
    useState<any[]>([]);

  const navigate =
    useNavigate();

  useEffect(()=>{

    const unsubscribe =

      listenAuth((data:any)=>{

        setUser(data);
      });

    return ()=>unsubscribe();

  },[]);

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

            (o:any)=>

              o.uid ===
              user.uid
          )

          .sort(

            (a:any,b:any)=>

              b.createdAt -
              a.createdAt
          );

        setOrders(
          myOrders as any[]
        );
      }
    );

  },[user]);

  return (

    <div className="
      min-h-screen
      p-8
    ">

      <div className="
        max-w-6xl
        mx-auto
      ">

        <h1 className="
          text-5xl
          font-black
          text-gray-800
          mb-8
        ">

          Order History

        </h1>

        <div className="
          bg-white
          rounded-[36px]
          shadow-2xl
          overflow-hidden
        ">

          {
            orders.length === 0 && (

              <div className="
                p-12
                text-center
                text-gray-500
              ">

                No Orders Yet

              </div>
            )
          }

          {
            orders.map(

              (
                order:any,
                index:number
              )=>(

                <div

                  key={index}

                  className="
                    p-6
                    border-b
                    flex
                    justify-between
                    items-center
                  "
                >

                  <div>

                    <h2 className="
                      text-xl
                      font-black
                      text-blue-600
                    ">

                      {
                        order.orderCode
                      }

                    </h2>

                    <p className="
                      text-gray-500
                      mt-2
                    ">

                      {
                        new Date(
                          order.createdAt
                        )
                        .toLocaleString()
                      }

                    </p>

                    <p className="
                      mt-2
                    ">

                      Status:
                      {" "}

                      <span
                        className={

                          order.status ===
                          "delivered"

                          ? "text-green-600 font-bold"

                          : order.status ===
                            "running"

                          ? "text-blue-600 font-bold"

                          : "text-orange-500 font-bold"
                        }
                      >

                        {
                          order.status
                        }

                      </span>

                    </p>

                    <p className="
                      mt-2
                      font-bold
                    ">

                      {
                        Number(
                          order.totalPrice || 0
                        )
                        .toLocaleString()
                      }đ

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
                      px-6
                      py-3
                      rounded-2xl
                      bg-blue-500
                      text-white
                      font-bold
                    "
                  >

                    {
                      order.status ===
                      "delivered"

                      ? "View"

                      : "Track"
                    }

                  </button>

                </div>
              )
            )
          }

        </div>

      </div>

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// NAV ITEM
////////////////////////////////////////////////////////////////////////////////

function NavItem({

  to,

  label,

  icon:Icon

}:any){

  const location = useLocation();

  const active =
    location.pathname === to;

  return (

    <Link

      to={to}

      className={`
        flex
        items-center
        gap-3
        px-5
        py-3
        rounded-2xl
        transition-all
        duration-300
        font-semibold

        ${
          active

            ? `
              bg-gradient-to-r
              from-blue-500
              to-indigo-500
              text-white
              shadow-xl
            `

            : `
              text-gray-600
              hover:bg-gray-100
            `
        }
      `}
    >

      <Icon size={20} />

      {label}

    </Link>
  );
}

////////////////////////////////////////////////////////////////////////////////
// CUSTOMER APP
////////////////////////////////////////////////////////////////////////////////

export default function CustomerApp() {

  ////////////////////////////////////////////////////
  // STATES
  ////////////////////////////////////////////////////

  const [user, setUser] =
    useState<any>(null);

  const [openMenu, setOpenMenu] =
    useState(false);

  ////////////////////////////////////////////////////
  // NAVIGATE
  ////////////////////////////////////////////////////

  const navigate =
    useNavigate();

  ////////////////////////////////////////////////////
  // AUTH LISTENER
  ////////////////////////////////////////////////////

  useEffect(()=>{

    const unsubscribe =

      listenAuth((data:any)=>{

        setUser(data);
      });

    return ()=>unsubscribe();

  },[]);

  ////////////////////////////////////////////////////
  // LOGOUT
  ////////////////////////////////////////////////////

  async function handleLogout(){

    await logoutUser();

    navigate("/customer/login");
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
    ">

      {/* NAVBAR */}

      <div className="
        sticky
        top-0
        z-50
        bg-white/80
        backdrop-blur-2xl
        border-b
        shadow-sm
      ">

        <div className="
          max-w-7xl
          mx-auto
          px-8
          py-5
          flex
          justify-between
          items-center
        ">

          {/* LOGO */}

          <div className="
            flex
            items-center
            gap-4
          ">

            <div className="
              w-14
              h-14
              rounded-2xl
              bg-gradient-to-r
              from-blue-500
              to-indigo-500
              text-white
              flex
              items-center
              justify-center
              shadow-xl
            ">

              <Truck size={30} />

            </div>

            <div>

              <h1 className="
                text-2xl
                font-black
                text-gray-800
              ">

                Logistics Shop

              </h1>

              <p className="
                text-sm
                text-gray-500
              ">

                Smart Delivery Platform

              </p>

            </div>

          </div>

          {/* RIGHT */}

          <div className="
            flex
            items-center
            gap-4
          ">

            {/* MENU */}

            <NavItem
              to="/customer/shop"
              label="Shop"
              icon={ShoppingCart}
            />

            <NavItem
              to="/customer/checkout"
              label="Checkout"
              icon={Package}
            />

            <NavItem
              to="/customer/tracking"
              label="Tracking"
              icon={MapPinned}
            />

            {/* USER */}

            {

              user ? (

                <div className="relative">

                  {/* BUTTON */}

                  <button

                    onClick={()=>
                      setOpenMenu(
                        !openMenu
                      )
                    }

                    className="
                      flex
                      items-center
                      gap-4
                      bg-white
                      border
                      rounded-2xl
                      px-4
                      py-3
                      shadow-lg
                      hover:shadow-xl
                      transition-all
                    "
                  >

                    {/* AVATAR */}

                    <div className="
                      w-12
                      h-12
                      rounded-full
                      bg-gradient-to-r
                      from-blue-500
                      to-indigo-500
                      text-white
                      flex
                      items-center
                      justify-center
                      font-bold
                      text-lg
                    ">

                      {
                        user.name
                          ?.charAt(0)
                          ?.toUpperCase()
                      }

                    </div>

                    {/* INFO */}

                    <div className="
                      text-left
                    ">

                      <h2 className="
                        font-bold
                        text-gray-800
                      ">

                        {user.name}

                      </h2>

                      <p className="
                        text-sm
                        text-gray-500
                      ">

                        {user.email}

                      </p>

                    </div>

                    <ChevronDown />

                  </button>

                  {/* DROPDOWN */}

                  {

                    openMenu && (

                      <div className="
                        absolute
                        right-0
                        mt-4
                        w-72
                        bg-white
                        rounded-3xl
                        shadow-2xl
                        border
                        overflow-hidden
                        z-50
                      ">

                        {/* HEADER */}

                        <div className="
                          p-5
                          border-b
                          bg-gradient-to-r
                          from-blue-500
                          to-indigo-500
                          text-white
                        ">

                          <h2 className="
                            text-xl
                            font-bold
                          ">

                            {user.name}

                          </h2>

                          <p className="
                            text-sm
                            opacity-80
                          ">

                            {user.email}

                          </p>

                        </div>

                        {/* MY ACCOUNT */}

                        <Link
                          to="/customer/account"
                        >

                          <button className="
                            w-full
                            flex
                            items-center
                            gap-4
                            px-5
                            py-4
                            hover:bg-gray-50
                            transition-all
                          ">

                            <User />

                            My Account

                          </button>

                        </Link>

                        {/* ORDER HISTORY */}

                        <Link
                          to="/customer/orders"
                        >

                          <button className="
                            w-full
                            flex
                            items-center
                            gap-4
                            px-5
                            py-4
                            hover:bg-gray-50
                            transition-all
                          ">

                            <ClipboardList />

                            Order History

                          </button>

                        </Link>

                        {/* LOGOUT */}

                        <button

                          onClick={handleLogout}

                          className="
                            w-full
                            flex
                            items-center
                            gap-4
                            px-5
                            py-4
                            text-red-500
                            hover:bg-red-50
                            transition-all
                          "
                        >

                          <LogOut />

                          Logout

                        </button>

                      </div>
                    )
                  }

                </div>

              ) : (

                <NavItem
                  to="/customer/login"
                  label="Login"
                  icon={User}
                />
              )
            }

          </div>

        </div>

      </div>

      {/* PAGE */}

      <div>

        <Routes>

          <Route
            path="/"
            element={
              <Navigate
                to="/customer/shop"
              />
            }
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/shop"
            element={<Shop />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/tracking"
            element={<TrackingOrder />}
          />
          <Route
            path="/tracking/:orderCode"
            element={<TrackingOrder />}
            />
          <Route
            path="/account"
            element={<MyAccount />}
          />

          <Route
            path="/orders"
            element={<OrderHistory />}
          />

        </Routes>

      </div>

    </div>
  );
}

