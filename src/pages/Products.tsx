
import {

  useEffect,

  useState

} from "react";

import {

  getDatabase,

  ref,

  onValue,

  update,

  remove,

  set

} from "firebase/database";

import {

  Package,

  Plus,

  Trash2,

  Save,

  Boxes,

  DollarSign,

  AlertTriangle

} from "lucide-react";

////////////////////////////////////////////////////////////////////////////////
// PRODUCTS
////////////////////////////////////////////////////////////////////////////////

export default function Products() {

  ////////////////////////////////////////////////////
  // FIREBASE
  ////////////////////////////////////////////////////

  const db =
    getDatabase();

  ////////////////////////////////////////////////////
  // STATES
  ////////////////////////////////////////////////////

  const [products, setProducts] =
    useState<any[]>([]);

  const [newProduct, setNewProduct] =
    useState({

      id:"",

      name:"",

      price:0,

      stock:0,

      category:"",

      temp:"",

      risk:"low",

      gas:false,

      img:""
    });

  ////////////////////////////////////////////////////
  // FIREBASE LISTENER
  ////////////////////////////////////////////////////

  useEffect(()=>{

    onValue(

      ref(db, "products"),

      (snapshot)=>{

        const data =
          snapshot.val() || {};

        const arr =

          Object.values(data);

        setProducts(arr);
      }
    );

  },[]);

  ////////////////////////////////////////////////////
  // UPDATE PRODUCT
  ////////////////////////////////////////////////////

  async function updateProduct(

    product:any

  ){

    await update(

      ref(
        db,
        `products/${product.id}`
      ),

      product
    );
  }

  ////////////////////////////////////////////////////
  // DELETE PRODUCT
  ////////////////////////////////////////////////////

  async function deleteProduct(

    id:string

  ){

    await remove(

      ref(
        db,
        `products/${id}`
      )
    );
  }

  ////////////////////////////////////////////////////
  // ADD PRODUCT
  ////////////////////////////////////////////////////

  async function addProduct(){

    if(
      !newProduct.id
      ||
      !newProduct.name
    ){
      return;
    }

    await set(

      ref(
        db,
        `products/${newProduct.id}`
      ),

      newProduct
    );

    //////////////////////////////////////////////////
    // RESET
    //////////////////////////////////////////////////

    setNewProduct({

      id:"",

      name:"",

      price:0,

      stock:0,

      category:"",

      temp:"",

      risk:"low",

      gas:false,

      img:""
    });
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

            Product Management

          </h1>

          <p className="
            text-gray-500
            mt-2
          ">

            Smart logistics inventory system

          </p>

        </div>

      </div>

      {/* TOP STATS */}

      <div className="
        grid
        grid-cols-3
        gap-5
        mb-8
      ">

        <TopCard
          title="Total Products"
          value={products.length}
          icon={<Package />}
          color="blue"
        />

        <TopCard
          title="Inventory"
          value={
            products.reduce(

              (sum,p)=>

                sum + Number(
                  p.stock || 0
                ),

              0
            )
          }
          icon={<Boxes />}
          color="green"
        />

        <TopCard
          title="Danger Products"
          value={
            products.filter(

              p=>p.risk === "danger"
            ).length
          }
          icon={<AlertTriangle />}
          color="red"
        />

      </div>

      {/* ADD PRODUCT */}

      <div className="
        bg-white/70
        backdrop-blur-2xl
        rounded-[36px]
        shadow-2xl
        border
        p-6
        mb-8
      ">

        <div className="
          flex
          items-center
          gap-3
          mb-6
        ">

          <Plus />

          <h2 className="
            text-2xl
            font-bold
          ">

            Add Product

          </h2>

        </div>

        <div className="
          grid
          grid-cols-4
          gap-4
        ">

          <input
            placeholder="ID"
            value={newProduct.id}
            onChange={(e)=>

              setNewProduct({

                ...newProduct,

                id:e.target.value
              })
            }
            className="
              p-4
              rounded-2xl
              border
              outline-none
            "
          />

          <input
            placeholder="Name"
            value={newProduct.name}
            onChange={(e)=>

              setNewProduct({

                ...newProduct,

                name:e.target.value
              })
            }
            className="
              p-4
              rounded-2xl
              border
              outline-none
            "
          />

          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e)=>

              setNewProduct({

                ...newProduct,

                price:Number(
                  e.target.value
                )
              })
            }
            className="
              p-4
              rounded-2xl
              border
              outline-none
            "
          />

          <input
            type="number"
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e)=>

              setNewProduct({

                ...newProduct,

                stock:Number(
                  e.target.value
                )
              })
            }
            className="
              p-4
              rounded-2xl
              border
              outline-none
            "
          />

          <input
            placeholder="Category"
            value={newProduct.category}
            onChange={(e)=>

              setNewProduct({

                ...newProduct,

                category:e.target.value
              })
            }
            className="
              p-4
              rounded-2xl
              border
              outline-none
            "
          />

          <input
            placeholder="Temperature"
            value={newProduct.temp}
            onChange={(e)=>

              setNewProduct({

                ...newProduct,

                temp:e.target.value
              })
            }
            className="
              p-4
              rounded-2xl
              border
              outline-none
            "
          />

          <select

            value={newProduct.risk}

            onChange={(e)=>

              setNewProduct({

                ...newProduct,

                risk:e.target.value
              })
            }

            className="
              p-4
              rounded-2xl
              border
              outline-none
            "
          >

            <option value="low">
              low
            </option>

            <option value="medium">
              medium
            </option>

            <option value="high">
              high
            </option>

            <option value="danger">
              danger
            </option>

          </select>

          <input
            placeholder="Image URL"
            value={newProduct.img}
            onChange={(e)=>

              setNewProduct({

                ...newProduct,

                img:e.target.value
              })
            }
            className="
              p-4
              rounded-2xl
              border
              outline-none
            "
          />

        </div>

        <button

          onClick={addProduct}

          className="
            mt-5
            px-8
            py-4
            rounded-2xl
            bg-gradient-to-r
            from-blue-500
            to-indigo-500
            text-white
            font-bold
            shadow-xl
          "
        >

          ADD PRODUCT

        </button>

      </div>

      {/* PRODUCTS */}

      <div className="
        grid
        grid-cols-2
        gap-6
      ">

        {

          products.map((product:any)=>(

            <div

              key={product.id}

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
                mb-6
              ">

                <div className="
                  flex
                  items-center
                  gap-5
                ">

                  <img
                    src={product.img}
                    className="
                      w-24
                      h-24
                      object-contain
                    "
                  />

                  <div>

                    <h2 className="
                      text-2xl
                      font-black
                      text-gray-800
                    ">

                      {product.name}

                    </h2>

                    <p className="
                      text-gray-500
                      mt-1
                    ">

                      {product.id}

                    </p>

                  </div>

                </div>

                <button

                  onClick={()=>
                    deleteProduct(
                      product.id
                    )
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

              {/* FORM */}

              <div className="
                grid
                grid-cols-2
                gap-4
              ">

                <InputField
                  label="Name"
                  value={product.name}
                  onChange={(v:string)=>{

                    product.name = v;

                    setProducts([
                      ...products
                    ]);
                  }}
                />

                <InputField
                  label="Category"
                  value={product.category}
                  onChange={(v:string)=>{

                    product.category = v;

                    setProducts([
                      ...products
                    ]);
                  }}
                />

                <InputField
                  label="Temperature"
                  value={product.temp}
                  onChange={(v:string)=>{

                    product.temp = v;

                    setProducts([
                      ...products
                    ]);
                  }}
                />

                <InputField
                  label="Risk"
                  value={product.risk}
                  onChange={(v:string)=>{

                    product.risk = v;

                    setProducts([
                      ...products
                    ]);
                  }}
                />

                <InputField
                  label="Price"
                  value={product.price}
                  type="number"
                  onChange={(v:string)=>{

                    product.price =
                      Number(v);

                    setProducts([
                      ...products
                    ]);
                  }}
                />

                <InputField
                  label="Stock"
                  value={product.stock}
                  type="number"
                  onChange={(v:string)=>{

                    product.stock =
                      Number(v);

                    setProducts([
                      ...products
                    ]);
                  }}
                />

              </div>

              {/* SAVE */}

              <button

                onClick={()=>
                  updateProduct(
                    product
                  )
                }

                className="
                  w-full
                  mt-6
                  py-4
                  rounded-2xl
                  bg-gradient-to-r
                  from-green-500
                  to-emerald-500
                  text-white
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-3
                  shadow-xl
                "
              >

                <Save />

                SAVE PRODUCT

              </button>

            </div>
          ))
        }

      </div>

    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// INPUT FIELD
////////////////////////////////////////////////////////////////////////////////

function InputField({

  label,

  value,

  onChange,

  type="text"

}:any){

  return (

    <div>

      <p className="
        text-sm
        font-bold
        text-gray-600
        mb-2
      ">

        {label}

      </p>

      <input

        type={type}

        value={value}

        onChange={(e)=>
          onChange(
            e.target.value
          )
        }

        className="
          w-full
          p-4
          rounded-2xl
          border
          outline-none
          focus:border-blue-500
        "
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

    blue:
      "from-blue-500 to-indigo-500",

    green:
      "from-green-500 to-emerald-500",

    red:
      "from-red-500 to-pink-500"
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
