
import {

  useEffect,

  useState

} from "react";

import {

  getDatabase,

  ref,

  onValue

} from "firebase/database";

import {

  ShoppingCart,

  AlertTriangle,

  Thermometer,

  Boxes

} from "lucide-react";

////////////////////////////////////////////////////////////////////////////////
// TYPES
////////////////////////////////////////////////////////////////////////////////

interface Product {

  id:string;

  name:string;

  category:string;

  temp:string;

  risk:string;

  gas:boolean;

  stock:number;

  price:number;

  img:string;
}

////////////////////////////////////////////////////////////////////////////////
// SHOP
////////////////////////////////////////////////////////////////////////////////

export default function Shop() {

  ////////////////////////////////////////////////////
  // STATES
  ////////////////////////////////////////////////////

  const [products, setProducts] =
    useState<Product[]>([]);

  
const [cart, setCart] =
  useState<any[]>(

    JSON.parse(

      localStorage.getItem(
        "cart"
      ) || "[]"
    )
  );


  ////////////////////////////////////////////////////
  // FIREBASE
  ////////////////////////////////////////////////////

  useEffect(()=>{

    const db =
      getDatabase();

    onValue(

      ref(db, "products"),

      (snapshot)=>{

        const data =
          snapshot.val() || {};

const arr:Product[] =

  Object.values(data) as Product[];
        setProducts(arr);
      }
    );

  },[]);




function addCart(

  product:Product

){

  //////////////////////////////////////////////////
  // LOAD CURRENT
  //////////////////////////////////////////////////

  const saved =

    JSON.parse(

      localStorage.getItem("cart")
      || "[]"
    );

  //////////////////////////////////////////////////
  // EXIST
  //////////////////////////////////////////////////

  const exist =

    saved.find(

      (item:any)=>

        item.id === product.id
    );

  //////////////////////////////////////////////////
  // UPDATED
  //////////////////////////////////////////////////

  let updated:any[] = [];

  if(exist){

    updated =

      saved.map((item:any)=>

        item.id === product.id

          ? {

              ...item,

              quantity:
                item.quantity + 1
            }

          : item
      );

  } else {

    updated = [

      ...saved,

      {

        ...product,

        quantity:1
      }
    ];
  }

  //////////////////////////////////////////////////
  // SAVE
  //////////////////////////////////////////////////

  localStorage.setItem(

    "cart",

    JSON.stringify(updated)
  );

  //////////////////////////////////////////////////
  // UPDATE UI
  //////////////////////////////////////////////////

  setCart(updated);

  //////////////////////////////////////////////////
  // DEBUG
  //////////////////////////////////////////////////

  console.log(updated);
}




  ////////////////////////////////////////////////////
  // TOTAL CART
  ////////////////////////////////////////////////////

  const totalCart =

        cart.reduce(

        (sum:number, item:any)=>

          sum + item.quantity,

        0
      );

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

      <div className="
        flex
        justify-between
        items-center
        mb-10
      ">

        <div>

          <h1 className="
            text-5xl
            font-black
            text-gray-800
          ">

            Logistics Shop

          </h1>

          <p className="
            text-gray-500
            mt-3
            text-lg
          ">

            Smart realtime logistics products

          </p>

        </div>

        {/* CART */}

        <div className="
          bg-white
          px-6
          py-4
          rounded-3xl
          shadow-2xl
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

            <ShoppingCart />

          </div>

          <div>

            <p className="
              text-sm
              text-gray-500
            ">

              Cart Items

            </p>

            <h2 className="
              text-3xl
              font-black
              text-gray-800
            ">

              {totalCart}

            </h2>

          </div>

        </div>

      </div>

      {/* PRODUCTS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-8
      ">

        {

          products.map((product)=>(

            <div

              key={product.id}

              className="
                bg-white/80
                backdrop-blur-2xl
                rounded-[36px]
                shadow-2xl
                border
                overflow-hidden
                hover:scale-[1.02]
                transition-all
                duration-300
              "
            >

              {/* IMAGE */}

              <div className="
                h-64
                bg-gradient-to-br
                from-slate-100
                to-blue-100
                flex
                items-center
                justify-center
                p-6
              ">

                <img

                  src={
                    product.img ||
                    "https://via.placeholder.com/150"
                  }

                  className="
                    h-44
                    object-contain
                  "
                />

              </div>

              {/* CONTENT */}

              <div className="p-6">

                {/* TOP */}

                <div className="
                  flex
                  justify-between
                  items-start
                  gap-4
                ">

                  <div>

                    <h2 className="
                      text-2xl
                      font-black
                      text-gray-800
                    ">

                      {String(product.name)}

                    </h2>

                    <p className="
                      text-gray-500
                      mt-2
                    ">

                      {String(product.category)}

                    </p>

                  </div>

                  {/* RISK */}

                  <div className={`
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    font-bold

                    ${
                      product.risk === "danger"

                        ? `
                          bg-red-100
                          text-red-600
                        `

                        : product.risk === "high"

                        ? `
                          bg-orange-100
                          text-orange-600
                        `

                        : `
                          bg-green-100
                          text-green-600
                        `
                    }
                  `}>

                    {String(product.risk)}

                  </div>

                </div>

                {/* INFO */}

                <div className="
                  grid
                  grid-cols-2
                  gap-4
                  mt-6
                ">

                  <InfoBox
                    icon={<Thermometer />}
                    label="Temperature"
                    value={String(product.temp)}
                  />

                  <InfoBox
                    icon={<Boxes />}
                    label="Stock"
                    value={String(product.stock)}
                  />

                </div>

                {/* GAS */}

                {

                  product.gas && (

                    <div className="
                      mt-5
                      bg-red-100
                      text-red-600
                      rounded-2xl
                      p-4
                      flex
                      items-center
                      gap-3
                      font-bold
                    ">

                      <AlertTriangle />

                      Gas Sensitive Product

                    </div>
                  )
                }

                {/* PRICE */}

                <div className="
                  mt-6
                  flex
                  justify-between
                  items-center
                ">

                  <div>

                    <p className="
                      text-sm
                      text-gray-500
                    ">

                      Price

                    </p>

                    <h2 className="
                      text-4xl
                      font-black
                      text-green-600
                    ">

                      {Number(
                        product.price || 0
                      ).toLocaleString()}đ

                    </h2>

                  </div>

                  <button

                    onClick={()=>
                      addCart(product)
                    }

                    className="
                      px-6
                      py-4
                      rounded-2xl
                      bg-gradient-to-r
                      from-blue-500
                      to-indigo-500
                      text-white
                      font-bold
                      shadow-xl
                      hover:scale-105
                      transition-all
                    "
                  >

                    ADD CART

                  </button>

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
// INFO BOX
////////////////////////////////////////////////////////////////////////////////

function InfoBox({

  icon,

  label,

  value

}:{

  icon:any;

  label:string;

  value:string;
}){

  return (

    <div className="
      bg-gray-50
      rounded-2xl
      p-4
    ">

      <div className="
        flex
        items-center
        gap-3
        mb-2
      ">

        <div className="
          text-blue-600
        ">

          {icon}

        </div>

        <p className="
          text-sm
          text-gray-500
        ">

          {label}

        </p>

      </div>

      <h2 className="
        font-bold
        text-gray-800
      ">

        {value}

      </h2>

    </div>
  );
}
