
import {

  useEffect,

  useState

} from "react";

import {

  getDatabase,

  ref,

  push,

  set

} from "firebase/database";
import {
  getAuth
} from "firebase/auth";
import {

  ShoppingBag,

  Trash2,

  Plus,

  Minus,

  Truck,

  MapPinned,

  Phone,

  User,

  NotebookPen

} from "lucide-react";

////////////////////////////////////////////////////////////////////////////////
// CHECKOUT
////////////////////////////////////////////////////////////////////////////////

export default function Checkout() {

  ////////////////////////////////////////////////////
  // CART
  ////////////////////////////////////////////////////

  const [cart, setCart] =
    useState<any[]>([]);

  ////////////////////////////////////////////////////
  // LOAD CART
  ////////////////////////////////////////////////////

  useEffect(()=>{

    const saved =

      localStorage.getItem(
        "cart"
      );

    if(saved){

      setCart(
        JSON.parse(saved)
      );

    } else {

      setCart([]);
    }

  },[]);

  ////////////////////////////////////////////////////
  // SAVE CART
  ////////////////////////////////////////////////////

  ////////////////////////////////////////////////////
  // CUSTOMER
  ////////////////////////////////////////////////////

  const [customer, setCustomer] =
    useState({

      name:"",

      phone:"",

      address:"",

      note:""
    });

  ////////////////////////////////////////////////////
  // LOADING
  ////////////////////////////////////////////////////

  const [loading, setLoading] =
    useState(false);

  ////////////////////////////////////////////////////
  // INCREASE
  ////////////////////////////////////////////////////

function increase(id:string){

  const updated =

    cart.map((item:any)=>

      item.id === id

        ? {

            ...item,

            quantity:
              item.quantity + 1
          }

        : item
    );

  setCart(updated);

  localStorage.setItem(

    "cart",

    JSON.stringify(updated)
  );
}

  ////////////////////////////////////////////////////
  // DECREASE
  ////////////////////////////////////////////////////


function decrease(id:string){

  const target =

    cart.find(

      (item:any)=>

        item.id === id
    );

  if(!target)
    return;

  //////////////////////////////////////////////////
  // REMOVE
  //////////////////////////////////////////////////

  if(target.quantity <= 1){

    removeItem(id);

    return;
  }

  //////////////////////////////////////////////////
  // UPDATE
  //////////////////////////////////////////////////

  const updated =

    cart.map((item:any)=>

      item.id === id

        ? {

            ...item,

            quantity:
              item.quantity - 1
          }

        : item
    );

  setCart(updated);

  localStorage.setItem(

    "cart",

    JSON.stringify(updated)
  );
}



  ////////////////////////////////////////////////////
  // REMOVE
  ////////////////////////////////////////////////////


function removeItem(id:string){

  const updated =

    cart.filter(

      (item:any)=>

        item.id !== id
    );

  setCart(updated);

  localStorage.setItem(

    "cart",

    JSON.stringify(updated)
  );
}



  ////////////////////////////////////////////////////
  // TOTAL
  ////////////////////////////////////////////////////

  const totalPrice =

    cart.reduce(

      (sum:number, item:any)=>

        sum +

        Number(item.price || 0)

        *

        Number(item.quantity || 0),

      0
    );

  ////////////////////////////////////////////////////
  // PLACE ORDER
  ////////////////////////////////////////////////////

  async function placeOrder(){

    //////////////////////////////////////////////////
    // VALIDATE
    //////////////////////////////////////////////////

    if(

      !customer.name ||

      !customer.phone ||

      !customer.address
    ){

      alert(
        "Please enter customer information"
      );

      return;
    }

    //////////////////////////////////////////////////
    // EMPTY
    //////////////////////////////////////////////////

    if(cart.length <= 0){

      alert(
        "Cart is empty"
      );

      return;
    }

    //////////////////////////////////////////////////
    // START
    //////////////////////////////////////////////////

    setLoading(true);

    try {

      const db =
        getDatabase();

      //////////////////////////////////////////////////
      // ORDER REF
      //////////////////////////////////////////////////

      const newOrder =

        push(
          ref(db, "orders")
        );

      //////////////////////////////////////////////////
      // SAVE
      //////////////////////////////////////////////////
      const auth =
  getAuth();

const uid =
  auth.currentUser?.uid;
        const orderCode =

  `#ORD-${
    new Date()
      .getFullYear()
  }${
    String(
      new Date().getMonth() + 1
    ).padStart(2,"0")
  }${
    String(
      new Date().getDate()
    ).padStart(2,"0")
  }-${
    Math.floor(
      1000 +
      Math.random() * 9000
    )
  }`;
    await set(newOrder, {

  uid,

  orderCode,

  customerName:
    customer.name,

  customerPhone:
    customer.phone,

  customerAddress:
    customer.address,

  customerNote:
    customer.note,

  items:
    cart,

  totalPrice,

  status:
    "pending",

  vehicle:
    "",

  progress:
    0,

  createdAt:
    Date.now()
});

      //////////////////////////////////////////////////
      // SUCCESS
      //////////////////////////////////////////////////

      alert(
  `Order placed successfully 🚚

Order Code:
${orderCode}`
);

      //////////////////////////////////////////////////
      // CLEAR
      //////////////////////////////////////////////////

      localStorage.removeItem(
        "cart"
      );

      setCart([]);

      setCustomer({

        name:"",

        phone:"",

        address:"",

        note:""
      });

    } catch(error){

      console.log(error);

      alert(
        "Checkout failed"
      );

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
      bg-gradient-to-br
      from-slate-100
      via-white
      to-blue-100
      p-8
    ">

      {/* HEADER */}

      <div className="mb-10">

        <h1 className="
          text-5xl
          font-black
          text-gray-800
        ">

          Checkout

        </h1>

        <p className="
          text-gray-500
          mt-3
          text-lg
        ">

          Smart logistics checkout system

        </p>

      </div>

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-3
        gap-8
      ">

        {/* LEFT */}

        <div className="
          xl:col-span-2
          space-y-6
        ">

          {

            cart.length <= 0 && (

              <div className="
                bg-white
                rounded-[36px]
                shadow-2xl
                p-20
                text-center
              ">

                <ShoppingBag
                  size={80}
                  className="
                    mx-auto
                    text-gray-300
                    mb-6
                  "
                />

                <h2 className="
                  text-3xl
                  font-black
                  text-gray-700
                ">

                  Cart Empty

                </h2>

              </div>
            )
          }

          {

            cart.map((item:any)=>(

              <div

                key={item.id}

                className="
                  bg-white/80
                  backdrop-blur-2xl
                  rounded-[36px]
                  shadow-2xl
                  border
                  p-6
                "
              >

                <div className="
                  flex
                  items-center
                  justify-between
                  gap-6
                ">

                  {/* LEFT */}

                  <div className="
                    flex
                    items-center
                    gap-6
                  ">

                    <img

                      src={item.img}

                      className="
                        w-32
                        h-32
                        object-contain
                      "
                    />

                    <div>

                      <h2 className="
                        text-2xl
                        font-black
                        text-gray-800
                      ">

                        {item.name}

                      </h2>

                      <p className="
                        text-gray-500
                        mt-2
                      ">

                        {item.category}

                      </p>

                      <h3 className="
                        text-3xl
                        font-black
                        text-green-600
                        mt-4
                      ">

                        {Number(
                          item.price
                        ).toLocaleString()}đ

                      </h3>

                    </div>

                  </div>

                  {/* RIGHT */}

                  <div className="
                    flex
                    flex-col
                    items-end
                    gap-5
                  ">

                    {/* QUANTITY */}

                    <div className="
                      flex
                      items-center
                      gap-4
                    ">

                      <button

                        onClick={()=>
                          decrease(item.id)
                        }

                        className="
                          w-12
                          h-12
                          rounded-2xl
                          bg-gray-100
                          flex
                          items-center
                          justify-center
                        "
                      >

                        <Minus />

                      </button>

                      <h2 className="
                        text-2xl
                        font-black
                        w-10
                        text-center
                      ">

                        {item.quantity}

                      </h2>

                      <button

                        onClick={()=>
                          increase(item.id)
                        }

                        className="
                          w-12
                          h-12
                          rounded-2xl
                          bg-blue-500
                          text-white
                          flex
                          items-center
                          justify-center
                        "
                      >

                        <Plus />

                      </button>

                    </div>

                    {/* REMOVE */}

                    <button

                      onClick={()=>
                        removeItem(item.id)
                      }

                      className="
                        px-5
                        py-3
                        rounded-2xl
                        bg-red-100
                        text-red-600
                        font-bold
                        flex
                        items-center
                        gap-3
                      "
                    >

                      <Trash2 />

                      Remove

                    </button>

                  </div>

                </div>

              </div>
            ))
          }

        </div>

        {/* RIGHT */}

        <div className="space-y-6">

          {/* CUSTOMER */}

          <div className="
            bg-white/80
            backdrop-blur-2xl
            rounded-[36px]
            shadow-2xl
            border
            p-6
          ">

            <h2 className="
              text-3xl
              font-black
              text-gray-800
              mb-6
            ">

              Customer Information

            </h2>

            <div className="space-y-5">

              <InputBox
                icon={<User />}
                placeholder="Full Name"
                value={customer.name}
                onChange={(v:string)=>

                  setCustomer({

                    ...customer,

                    name:v
                  })
                }
              />

              <InputBox
                icon={<Phone />}
                placeholder="Phone Number"
                value={customer.phone}
                onChange={(v:string)=>

                  setCustomer({

                    ...customer,

                    phone:v
                  })
                }
              />

              <InputBox
                icon={<MapPinned />}
                placeholder="Delivery Address"
                value={customer.address}
                onChange={(v:string)=>

                  setCustomer({

                    ...customer,

                    address:v
                  })
                }
              />

              <InputBox
                icon={<NotebookPen />}
                placeholder="Note"
                value={customer.note}
                onChange={(v:string)=>

                  setCustomer({

                    ...customer,

                    note:v
                  })
                }
              />

            </div>

          </div>

          {/* SUMMARY */}

          <div className="
            bg-gradient-to-r
            from-blue-500
            to-indigo-500
            text-white
            rounded-[36px]
            shadow-2xl
            p-6
          ">

            <div className="
              flex
              justify-between
              items-center
              mb-6
            ">

              <div>

                <p className="
                  opacity-80
                ">

                  Total Price

                </p>

                <h2 className="
                  text-5xl
                  font-black
                  mt-3
                ">

                  {totalPrice.toLocaleString()}đ

                </h2>

              </div>

              <Truck size={52} />

            </div>

            <button

              onClick={placeOrder}

              disabled={loading}

              className="
                w-full
                py-5
                rounded-3xl
                bg-white
                text-blue-600
                text-xl
                font-black
                shadow-xl
                hover:scale-[1.02]
                transition-all
              "
            >

              {

                loading

                  ? "PROCESSING..."

                  : "PLACE ORDER"
              }

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// INPUT
////////////////////////////////////////////////////////////////////////////////

function InputBox({

  icon,

  placeholder,

  value,

  onChange

}:any){

  return (

    <div className="
      flex
      items-center
      gap-4
      bg-gray-50
      rounded-3xl
      px-5
      py-4
    ">

      <div className="
        text-blue-600
      ">

        {icon}

      </div>

      <input

        placeholder={placeholder}

        value={value}

        onChange={(e)=>
          onChange(
            e.target.value
          )
        }

        className="
          flex-1
          bg-transparent
          outline-none
          text-lg
        "
      />

    </div>
  );
}
