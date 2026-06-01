
import {

  useState

} from "react";

import {

  useNavigate,

  Link

} from "react-router-dom";

import {

  Truck,

  ShieldCheck,

  Mail,

  LockKeyhole

} from "lucide-react";

import {

  loginUser

} from "../services/auth";

export default function Login() {

  ////////////////////////////////////////////////////
  // STATES
  ////////////////////////////////////////////////////

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  ////////////////////////////////////////////////////
  // NAVIGATE
  ////////////////////////////////////////////////////

  const navigate =
    useNavigate();

  ////////////////////////////////////////////////////
  // LOGIN
  ////////////////////////////////////////////////////

  async function handleLogin(){

    try {

      setLoading(true);

      setError("");

      //////////////////////////////////////////////////
      // FIREBASE LOGIN
      //////////////////////////////////////////////////

      const result =

        await loginUser(

          email,

          password
        );

      //////////////////////////////////////////////////
      // ERROR
      //////////////////////////////////////////////////

      if(!result.success){

        setError(
          result.error
        );

        return;
      }

      //////////////////////////////////////////////////
      // SUCCESS
      //////////////////////////////////////////////////

      navigate("/customer/shop");

    } catch(err:any){

      setError(err.message);

    } finally {

      setLoading(false);
    }
  }

  ////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////

  return (

    <div className="
      min-h-screen
      overflow-hidden
      relative
      bg-gradient-to-br
      from-slate-950
      via-blue-950
      to-slate-900
      flex
      items-center
      justify-center
      p-6
    ">

      {/* BACKGROUND EFFECT */}

      <div className="
        absolute
        w-[700px]
        h-[700px]
        rounded-full
        bg-blue-500/20
        blur-3xl
        -top-40
        -left-40
      " />

      <div className="
        absolute
        w-[600px]
        h-[600px]
        rounded-full
        bg-indigo-500/20
        blur-3xl
        bottom-[-200px]
        right-[-200px]
      " />

      {/* LOGIN CARD */}

      <div className="
        relative
        z-10
        w-full
        max-w-6xl
        grid
        grid-cols-2
        rounded-[40px]
        overflow-hidden
        border
        border-white/10
        shadow-[0_20px_80px_rgba(0,0,0,0.6)]
        backdrop-blur-3xl
        bg-white/5
      ">

        {/* LEFT SIDE */}

        <div className="
          relative
          p-14
          flex
          flex-col
          justify-between
          bg-gradient-to-br
          from-blue-600/30
          to-indigo-600/10
        ">

          <div>

            <div className="
              w-24
              h-24
              rounded-[28px]
              bg-gradient-to-r
              from-blue-500
              to-indigo-500
              text-white
              flex
              items-center
              justify-center
              shadow-2xl
            ">

              <Truck size={52} />

            </div>

            <h1 className="
              text-6xl
              font-black
              text-white
              mt-10
              leading-tight
            ">

              Smart
              <br />

              Logistics
              <br />

              Platform

            </h1>

            <p className="
              text-blue-100/80
              text-lg
              mt-8
              leading-relaxed
              max-w-md
            ">

              Intelligent logistics monitoring,
              realtime delivery tracking,
              smart route management
              and secure transportation
              system.

            </p>

          </div>

          {/* FEATURES */}

          <div className="
            space-y-5
            mt-14
          ">

            <div className="
              flex
              items-center
              gap-4
              text-white
            ">

              <div className="
                w-14
                h-14
                rounded-2xl
                bg-white/10
                flex
                items-center
                justify-center
              ">

                <ShieldCheck />

              </div>

              <div>

                <h2 className="font-bold">
                  Secure Authentication
                </h2>

                <p className="
                  text-sm
                  text-blue-100/70
                ">
                  Firebase protected access
                </p>

              </div>

            </div>

            <div className="
              flex
              items-center
              gap-4
              text-white
            ">

              <div className="
                w-14
                h-14
                rounded-2xl
                bg-white/10
                flex
                items-center
                justify-center
              ">

                🚚

              </div>

              <div>

                <h2 className="font-bold">
                  Realtime GPS Tracking
                </h2>

                <p className="
                  text-sm
                  text-blue-100/70
                ">
                  Smart live monitoring
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="
          bg-white
          p-14
          flex
          flex-col
          justify-center
        ">

          <div className="max-w-md mx-auto w-full">

            <div className="mb-10">

              <h2 className="
                text-5xl
                font-black
                text-gray-800
              ">

                Login

              </h2>

              <p className="
                text-gray-500
                mt-4
                text-lg
              ">

                Access your logistics account

              </p>

            </div>

            {/* ERROR */}

            {

              error && (

                <div className="
                  mb-5
                  bg-red-100
                  text-red-600
                  px-4
                  py-3
                  rounded-2xl
                  text-sm
                ">

                  {error}

                </div>
              )
            }

            {/* EMAIL */}

            <div className="mb-6">

              <label className="
                block
                text-sm
                font-bold
                text-gray-600
                mb-3
              ">

                Email Address

              </label>

              <div className="
                flex
                items-center
                gap-4
                border-2
                border-gray-100
                rounded-2xl
                px-5
                py-4
                focus-within:border-blue-500
                transition-all
              ">

                <Mail className="
                  text-gray-400
                " />

                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e)=>
                    setEmail(e.target.value)
                  }
                  className="
                    flex-1
                    outline-none
                    text-lg
                  "
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="mb-8">

              <label className="
                block
                text-sm
                font-bold
                text-gray-600
                mb-3
              ">

                Password

              </label>

              <div className="
                flex
                items-center
                gap-4
                border-2
                border-gray-100
                rounded-2xl
                px-5
                py-4
                focus-within:border-blue-500
                transition-all
              ">

                <LockKeyhole className="
                  text-gray-400
                " />

                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e)=>
                    setPassword(e.target.value)
                  }
                  className="
                    flex-1
                    outline-none
                    text-lg
                  "
                />

              </div>

            </div>

            {/* BUTTON */}

            <button

              onClick={handleLogin}

              disabled={loading}

              className="
                w-full
                py-5
                rounded-2xl
                bg-gradient-to-r
                from-blue-600
                to-indigo-600
                text-white
                text-lg
                font-black
                shadow-2xl
                hover:scale-[1.02]
                hover:shadow-blue-500/30
                transition-all
              "
            >

              {
                loading
                  ? "LOADING..."
                  : "LOGIN NOW"
              }

            </button>

            {/* REGISTER */}

            <Link to="/customer/register">

              <button className="
                w-full
                py-5
                rounded-2xl
                border-2
                border-gray-100
                mt-5
                text-lg
                font-bold
                hover:bg-gray-50
                transition-all
              ">

                CREATE ACCOUNT

              </button>

            </Link>

            {/* FOOTER */}

            <div className="
              mt-10
              text-center
              text-gray-400
            ">

              © 2026 Smart Logistics System

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

