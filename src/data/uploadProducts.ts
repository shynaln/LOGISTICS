
import "../services/firebase";

import {

  getDatabase,

  ref,

  set

} from "firebase/database";

////////////////////////////////////////////////////////////////////////////////
// PRODUCTS
////////////////////////////////////////////////////////////////////////////////

const products = [

  {
    id: "p1",
    name: "💉 Vaccine y tế",
    temp: "2-8°C",
    risk: "high",
    gas: false,
    price: 450000,
    stock: 20,
    category: "Medical",
    img: "https://cdn-icons-png.flaticon.com/512/4190/4190876.png"
  },

  {
    id: "p2",
    name: "🧪 Hóa chất công nghiệp",
    temp: "<25°C",
    risk: "danger",
    gas: true,
    price: 1200000,
    stock: 15,
    category: "Chemical",
    img: "https://cdn-icons-png.flaticon.com/512/3880/3880536.png"
  },

  {
    id: "p3",
    name: "🥶 Thực phẩm đông lạnh",
    temp: "-18°C",
    risk: "medium",
    gas: false,
    price: 350000,
    stock: 30,
    category: "Food",
    img: "https://cdn-icons-png.flaticon.com/512/2935/2935394.png"
  },

  {
    id: "p4",
    name: "🍎 Trái cây tươi",
    temp: "5-10°C",
    risk: "medium",
    gas: false,
    price: 180000,
    stock: 25,
    category: "Food",
    img: "https://cdn-icons-png.flaticon.com/512/415/415733.png"
  },

  {
    id: "p5",
    name: "🛢️ Bình gas",
    temp: "normal",
    risk: "danger",
    gas: true,
    price: 950000,
    stock: 12,
    category: "Gas",
    img: "https://cdn-icons-png.flaticon.com/512/9747/9747063.png"
  },

  {
    id: "p6",
    name: "💊 Thuốc kháng sinh",
    temp: "15-25°C",
    risk: "high",
    gas: false,
    price: 520000,
    stock: 40,
    category: "Medical",
    img: "https://cdn-icons-png.flaticon.com/512/822/822143.png"
  },

  {
    id: "p7",
    name: "🧫 Sinh phẩm xét nghiệm",
    temp: "2-8°C",
    risk: "high",
    gas: false,
    price: 780000,
    stock: 18,
    category: "Medical",
    img: "https://cdn-icons-png.flaticon.com/512/2785/2785819.png"
  },

  {
    id: "p8",
    name: "🔥 Khí dễ cháy",
    temp: "normal",
    risk: "danger",
    gas: true,
    price: 1500000,
    stock: 10,
    category: "Gas",
    img: "https://cdn-icons-png.flaticon.com/512/785/785116.png"
  },

  {
    id: "p9",
    name: "📦 Linh kiện điện tử",
    temp: "<30°C",
    risk: "low",
    gas: false,
    price: 640000,
    stock: 50,
    category: "Electronic",
    img: "https://cdn-icons-png.flaticon.com/512/3659/3659899.png"
  }
];

////////////////////////////////////////////////////////////////////////////////
// UPLOAD
////////////////////////////////////////////////////////////////////////////////

async function uploadProducts(){

  const db =
    getDatabase();

  for(const product of products){

    await set(

      ref(
        db,
        `products/${product.id}`
      ),

      product
    );

    console.log(
      "Uploaded:",
      product.name
    );
  }

  console.log(
    "DONE UPLOAD PRODUCTS"
  );
}

uploadProducts();

