
import {

  useState

} from "react";

import {

  useNavigate,

  Link

} from "react-router-dom";

import {

  Truck,

  Mail,

  LockKeyhole,

  User,

  UserPlus

} from "lucide-react";

import {

  registerUser

} from "../services/auth";

export default function Register() {

  ////////////////////////////////////////////////////
  // STATES
  ////////////////////////////////////////////////////

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
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
  // REGISTER
  ////////////////////////////////////////////////////

  async function handleRegister(){

    try {

      setLoading(true);

      setError("");

      //////////////////////////////////////////////////
      // VALIDATE
      //////////////////////////////////////////////////

      if(!name){

        setError(
          "Please enter full name"
        );

        return;
      }

      if(password !== confirmPassword){

        setError(
          "Passwords do not match"
        );

        return;
      }

      //////////////////////////////////////////////////
      // FIREBASE REGISTER
      //////////////////////////////////////////////////

      const result =

        await registerUser(

          name,

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

      navigate("/customer/login");

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

      {/* BACKGROUND */}

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

      {/* CARD */}

      <div className="
        relative
        z-10
        w-full
        max-w-md
        bg-white
        rounded-[40px]
        shadow-[0_20px_80px_rgba(0,0,0,0.6)]
        p-10
      ">

        {/* LOGO */}

        <div className="text-center mb-10">

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
            mx-auto
            shadow-2xl
          ">

            <Truck size={50} />

          </div>

          <h1 className="
            text-5xl
            font-black
            text-gray-800
            mt-6
          ">

            Register

          </h1>

          <p className="
            text-gray-500
            mt-3
          ">

            Create your logistics account

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

        {/* FULL NAME */}

        <div className="mb-5">

          <label className="
            block
            text-sm
            font-bold
            text-gray-600
            mb-3
          ">

            Full Name

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

            <User className="
              text-gray-400
            " />

            <input
              type="text"
              placeholder="Tran Dong"
              value={name}
              onChange={(e)=>
                setName(e.target.value)
              }
              className="
                flex-1
                outline-none
                text-lg
              "
            />

          </div>

        </div>

        {/* EMAIL */}

        <div className="mb-5">

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

        <div className="mb-5">

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

        {/* CONFIRM PASSWORD */}

        <div className="mb-8">

          <label className="
            block
            text-sm
            font-bold
            text-gray-600
            mb-3
          ">

            Confirm Password

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

            <UserPlus className="
              text-gray-400
            " />

            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e)=>
                setConfirmPassword(e.target.value)
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

          onClick={handleRegister}

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
              ? "CREATING..."
              : "CREATE ACCOUNT"
          }

        </button>

        {/* LOGIN */}

        <Link to="/customer/login">

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

            BACK TO LOGIN

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
  );
}

