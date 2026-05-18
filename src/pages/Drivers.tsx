import { useEffect, useState } from "react";

import {
  User,
  Truck,
  Phone,
  Send,
  Search,
  Route,
  Trash2,
  Plus,
  MessageCircle,
  CheckCircle2
} from "lucide-react";

import { db } from "../services/firebase";

import {
  ref,
  set,
  onValue,
  remove,
  update
} from "firebase/database";

////////////////////////////////////////////////////////////////////////////////
// TYPES
////////////////////////////////////////////////////////////////////////////////

type Driver = {

  name: string;

  phone: string;

  truck: string;

  telegram?: string;

  status: "online" | "offline";

  route?: string;
};

const ROUTES = ["R1", "R2", "R3"];

////////////////////////////////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////////////////////////////////

export default function Drivers() {

  const [drivers, setDrivers] =
    useState<any>({});

  const [selected, setSelected] =
    useState<Driver | null>(null);

  const [search, setSearch] =
    useState("");

  const [route, setRoute] =
    useState("");

  const [msg, setMsg] =
    useState("");

  const [form, setForm] =
    useState({

      name: "",

      phone: "",

      truck: "",

      telegram: ""
    });

  ////////////////////////////////////////////////////////////////////////////
  // FIREBASE
  ////////////////////////////////////////////////////////////////////////////

  useEffect(() => {

    onValue(

      ref(db, "drivers"),

      (snap) => {

        setDrivers(
          snap.val() || {}
        );
      }
    );

  }, []);

  ////////////////////////////////////////////////////////////////////////////
  // ROUTE LOCK
  ////////////////////////////////////////////////////////////////////////////

  const usedRoutes =

    Object.values(drivers)

      .map((d:any)=>d.route)

      .filter(Boolean);

  const availableRoutes =

    ROUTES.filter((r)=>{

      if(selected?.route===r)
        return true;

      return !usedRoutes.includes(r);
    });

  ////////////////////////////////////////////////////////////////////////////
  // CRUD
  ////////////////////////////////////////////////////////////////////////////

  const addDriver = async () => {

    if (!form.phone)
      return;

    await set(

      ref(db, "drivers/" + form.phone),

      {

        ...form,

        status: "offline",

        route: ""
      }
    );

    setForm({

      name: "",

      phone: "",

      truck: "",

      telegram: ""
    });
  };

  const deleteDriver = async (
    phone:string
  ) => {

    await remove(
      ref(db, "drivers/" + phone)
    );

    if (
      selected?.phone === phone
    ) {
      setSelected(null);
    }
  };

  const updateDriver = async () => {

    if (!selected)
      return;

    await update(

      ref(
        db,
        "drivers/" + selected.phone
      ),

      selected
    );
  };

  ////////////////////////////////////////////////////////////////////////////
  // ASSIGN
  ////////////////////////////////////////////////////////////////////////////

  const assignRoute = async () => {

    if (!selected || !route)
      return;

    const isUsed =

      Object.values(drivers)

        .some(

          (d:any)=>

            d.route === route &&

            d.phone !== selected.phone
        );

    if (isUsed) {

      alert("❌ Route đã có tài xế!");

      return;
    }

    await update(

      ref(
        db,
        "drivers/" + selected.phone
      ),

      {
        route
      }
    );

    await set(

      ref(
        db,
        "vehicles/" + route
      ),

      {

        driver:
          selected.name,

        truck:
          selected.truck,

        route,

        status:"idle"
      }
    );
  };

  ////////////////////////////////////////////////////////////////////////////
  // TELEGRAM
  ////////////////////////////////////////////////////////////////////////////

  const sendTelegram = async () => {

    if (!selected?.telegram) {

      alert("Driver chưa có Telegram ID");

      return;
    }

    await fetch(

      "http://localhost:3000/send-telegram",

      {

        method:"POST",

        headers:{

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          chatId:
            selected.telegram,

          text: msg
        })
      }
    );

    setMsg("");
  };

  ////////////////////////////////////////////////////////////////////////////
  // FILTER
  ////////////////////////////////////////////////////////////////////////////

  const list =

    Object.values(drivers)

      .filter(

        (d:any)=>

          d.name
            ?.toLowerCase()

            .includes(
              search.toLowerCase()
            )
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
            Driver Management
          </h1>

          <p className="
            text-gray-500
            mt-1
          ">
            Smart logistics driver system
          </p>

        </div>

        <div className="
          flex
          gap-5
        ">

          <TopCard
            title="Total Drivers"
            value={
              Object.keys(drivers)
                .length
            }
            icon={<User />}
            color="blue"
          />

          <TopCard
            title="Online"
            value={
              Object.values(drivers)

                .filter(
                  (d:any)=>
                    d.status==="online"
                )

                .length
            }
            icon={<CheckCircle2 />}
            color="green"
          />

        </div>

      </div>

      {/* MAIN */}

      <div className="
        grid
        grid-cols-3
        gap-6
      ">

        {/* LEFT */}

        <div className="
          bg-white/70
          backdrop-blur-2xl
          rounded-[32px]
          shadow-2xl
          border
          p-6
          col-span-1
        ">

          {/* TOP */}

          <div className="
            flex
            justify-between
            items-center
            mb-5
          ">

            <div>

              <h2 className="
                text-2xl
                font-bold
                text-gray-800
              ">
                Drivers
              </h2>

              <p className="
                text-sm
                text-gray-500
              ">
                Driver list
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

              <Truck />

            </div>

          </div>

          {/* SEARCH */}

          <div className="
            relative
            mb-5
          ">

            <Search
              size={18}
              className="
                absolute
                left-4
                top-3.5
                text-gray-400
              "
            />

            <input

              placeholder="Search driver..."

              value={search}

              onChange={(e)=>
                setSearch(e.target.value)
              }

              className="
                w-full
                bg-gray-50
                border
                rounded-2xl
                py-3
                pl-11
                pr-4
                outline-none
                focus:ring-2
                focus:ring-blue-400
              "
            />

          </div>

          {/* LIST */}

          <div className="
            space-y-4
            max-h-[420px]
            overflow-auto
          ">

            {list.map((d:any)=>(

              <div

                key={d.phone}

                onClick={()=>{

                  setSelected(d);

                  setRoute(
                    d.route || ""
                  );
                }}

                className={`
                  p-4
                  rounded-3xl
                  cursor-pointer
                  transition-all
                  border

                  ${
                    selected?.phone===d.phone

                      ? `
                        bg-gradient-to-r
                        from-blue-500
                        to-indigo-500
                        text-white
                        shadow-xl
                      `

                      : `
                        bg-white
                        hover:shadow-lg
                      `
                  }
                `}
              >

                <div className="
                  flex
                  justify-between
                  items-center
                ">

                  <div className="
                    flex
                    items-center
                    gap-3
                  ">

                    <div className={`
                      w-12
                      h-12
                      rounded-2xl
                      flex
                      items-center
                      justify-center

                      ${
                        selected?.phone===d.phone

                          ? "bg-white/20"

                          : `
                            bg-blue-100
                            text-blue-600
                          `
                      }
                    `}>

                      <User />

                    </div>

                    <div>

                      <h2 className="
                        font-bold
                      ">
                        {d.name}
                      </h2>

                      <p className={`
                        text-sm

                        ${
                          selected?.phone===d.phone

                            ? "text-white/70"

                            : "text-gray-500"
                        }
                      `}>

                        {d.truck}

                      </p>

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
                        d.status==="online"

                          ? `
                            bg-green-500
                            text-white
                          `

                          : `
                            bg-gray-300
                            text-gray-700
                          `
                      }
                    `}
                  >

                    {d.status}

                  </div>

                </div>

                <div className="
                  mt-3
                  text-sm
                ">

                  Route:
                  {" "}
                  {d.route || "None"}

                </div>

              </div>

            ))}

          </div>

          {/* FORM */}

          <div className="
            mt-6
            pt-5
            border-t
            space-y-3
          ">

            <Input
              placeholder="Driver Name"
              value={form.name}
              onChange={(v:string)=>
                setForm({
                  ...form,
                  name:v
                })
              }
            />

            <Input
              placeholder="Phone Number"
              value={form.phone}
              onChange={(v:string)=>
                setForm({
                  ...form,
                  phone:v
                })
              }
            />

            <Input
              placeholder="Truck ID"
              value={form.truck}
              onChange={(v:string)=>
                setForm({
                  ...form,
                  truck:v
                })
              }
            />

            <Input
              placeholder="Telegram ID"
              value={form.telegram}
              onChange={(v:string)=>
                setForm({
                  ...form,
                  telegram:v
                })
              }
            />

            <button

              onClick={addDriver}

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

              <Plus size={20} />

              Add Driver

            </button>

          </div>

        </div>

        {/* RIGHT */}

        <div className="
          col-span-2
          bg-white/70
          backdrop-blur-2xl
          rounded-[32px]
          shadow-2xl
          border
          p-6
        ">

          {!selected ? (

            <div className="
              h-full
              flex
              flex-col
              items-center
              justify-center
              text-gray-400
            ">

              <Truck size={80} />

              <p className="
                mt-5
                text-xl
              ">
                Select a driver
              </p>

            </div>

          ) : (

            <>

              {/* HEADER */}

              <div className="
                flex
                justify-between
                items-center
                mb-6
              ">

                <div className="
                  flex
                  items-center
                  gap-5
                ">

                  <div className="
                    w-20
                    h-20
                    rounded-[28px]
                    bg-gradient-to-r
                    from-blue-500
                    to-indigo-500
                    text-white
                    flex
                    items-center
                    justify-center
                    shadow-xl
                  ">

                    <User size={36} />

                  </div>

                  <div>

                    <h2 className="
                      text-3xl
                      font-bold
                      text-gray-800
                    ">
                      {selected.name}
                    </h2>

                    <p className="
                      text-gray-500
                      mt-1
                    ">
                      {selected.truck}
                    </p>

                  </div>

                </div>

                <div
                  className={`
                    px-5
                    py-2
                    rounded-full
                    text-sm
                    font-bold

                    ${
                      selected.status==="online"

                        ? `
                          bg-green-100
                          text-green-700
                        `

                        : `
                          bg-gray-200
                          text-gray-700
                        `
                    }
                  `}
                >

                  {selected.status}

                </div>

              </div>

              {/* INFO */}

              <div className="
                grid
                grid-cols-2
                gap-5
                mb-6
              ">

                <InfoCard
                  icon={<Phone />}
                  title="Phone"
                  value={selected.phone}
                />

                <InfoCard
                  icon={<Truck />}
                  title="Truck"
                  value={selected.truck}
                />

                <InfoCard
                  icon={<Send />}
                  title="Telegram"
                  value={
                    selected.telegram ||
                    "None"
                  }
                />

                <InfoCard
                  icon={<Route />}
                  title="Route"
                  value={
                    selected.route ||
                    "None"
                  }
                />

              </div>

              {/* ROUTES */}

              <div className="
                bg-gray-50
                rounded-[32px]
                p-5
                mb-6
              ">

                <h2 className="
                  text-xl
                  font-bold
                  text-gray-800
                  mb-4
                ">
                  Assign Route
                </h2>

                <div className="
                  flex
                  gap-4
                ">

                  {availableRoutes.map((r)=>(

                    <button

                      key={r}

                      onClick={()=>
                        setRoute(r)
                      }

                      className={`
                        flex-1
                        py-4
                        rounded-3xl
                        font-bold
                        transition-all

                        ${
                          route===r

                            ? `
                              bg-gradient-to-r
                              from-blue-500
                              to-indigo-500
                              text-white
                              shadow-lg
                            `

                            : `
                              bg-white
                              border
                            `
                        }
                      `}
                    >

                      {r}

                    </button>

                  ))}

                </div>

              </div>

              {/* TELEGRAM */}

              <div className="
                bg-gray-50
                rounded-[32px]
                p-5
                mb-6
              ">

                <h2 className="
                  text-xl
                  font-bold
                  text-gray-800
                  mb-4
                ">
                  Send Telegram Message
                </h2>

                <div className="
                  flex
                  gap-4
                ">

                  <input

                    value={msg}

                    onChange={(e)=>
                      setMsg(e.target.value)
                    }

                    placeholder="Enter message..."

                    className="
                      flex-1
                      bg-white
                      border
                      rounded-2xl
                      px-4
                      py-3
                      outline-none
                      focus:ring-2
                      focus:ring-green-400
                    "
                  />

                  <button

                    onClick={sendTelegram}

                    className="
                      px-6
                      rounded-2xl
                      bg-gradient-to-r
                      from-green-500
                      to-emerald-500
                      text-white
                      font-bold
                      shadow-lg
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <MessageCircle size={18} />

                    Send

                  </button>

                </div>

              </div>

              {/* ACTION */}

              <div className="
                flex
                gap-4
              ">

                <button

                  onClick={assignRoute}

                  className="
                    flex-1
                    py-4
                    rounded-3xl
                    bg-gradient-to-r
                    from-blue-500
                    to-indigo-500
                    text-white
                    font-bold
                    shadow-xl
                    hover:scale-[1.02]
                    transition-all
                  "
                >

                  🚀 Assign Route

                </button>

                <button

                  onClick={updateDriver}

                  className="
                    flex-1
                    py-4
                    rounded-3xl
                    bg-gradient-to-r
                    from-yellow-500
                    to-orange-500
                    text-white
                    font-bold
                    shadow-xl
                    hover:scale-[1.02]
                    transition-all
                  "
                >

                  ✏️ Update

                </button>

                <button

                  onClick={()=>
                    deleteDriver(
                      selected.phone
                    )
                  }

                  className="
                    flex-1
                    py-4
                    rounded-3xl
                    bg-gradient-to-r
                    from-red-500
                    to-pink-500
                    text-white
                    font-bold
                    shadow-xl
                    hover:scale-[1.02]
                    transition-all
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >

                  <Trash2 size={18} />

                  Delete

                </button>

              </div>

            </>

          )}

        </div>

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

    green:
      "from-green-500 to-emerald-500"
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

////////////////////////////////////////////////////////////////////////////////
// INPUT
////////////////////////////////////////////////////////////////////////////////

function Input({

  placeholder,
  value,
  onChange

}:any){

  return (

    <input

      placeholder={placeholder}

      value={value}

      onChange={(e)=>
        onChange(e.target.value)
      }

      className="
        w-full
        bg-gray-50
        border
        rounded-2xl
        px-4
        py-3
        outline-none
        focus:ring-2
        focus:ring-blue-400
      "
    />
  );
}

////////////////////////////////////////////////////////////////////////////////
// INFO CARD
////////////////////////////////////////////////////////////////////////////////

function InfoCard({

  icon,
  title,
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
        text-blue-600
        mb-3
      ">

        {icon}

        <span className="
          text-sm
          font-medium
        ">
          {title}
        </span>

      </div>

      <h2 className="
        font-bold
        text-gray-800
        break-all
      ">
        {value}
      </h2>

    </div>
  );
}