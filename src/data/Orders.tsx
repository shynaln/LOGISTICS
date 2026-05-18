import { useState } from "react";
import { products } from "../data/products";
import { getDatabase, ref, push, set } from "firebase/database";

export default function Orders() {
  const db = getDatabase();

  const [cart, setCart] = useState<any>({});

  const add = (id: string) => {
    setCart((prev: any) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const remove = (id: string) => {
    setCart((prev: any) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0)
    }));
  };

  ////////////////////////////////////////////////////////////////
  // AUTO ASSIGN TRUCK
  ////////////////////////////////////////////////////////////////
  const assignTruck = () => {
    const trucks = ["R1", "R2", "R3"];
    return trucks[Math.floor(Math.random() * trucks.length)];
  };

  ////////////////////////////////////////////////////////////////
  // PLACE ORDER
  ////////////////////////////////////////////////////////////////
  const placeOrder = async () => {
    const truck = assignTruck();

    const newRef = push(ref(db, "orders"));

    await set(newRef, {
      items: cart,
      status: "pending",
      truck,
      progress: 0,
      createdAt: Date.now()
    });

    alert("Đặt hàng thành công 🚚");
    setCart({});
  };

  return (
    <div className="p-6 grid grid-cols-3 gap-4">

      {products.map(p => (
        <div key={p.id} className="bg-white p-4 rounded-xl shadow">
          <img src={p.img} className="h-24 mx-auto mb-2" />
          <h3>{p.name}</h3>

          <div className="flex justify-between mt-2">
            <button onClick={() => remove(p.id)}>-</button>
            <span>{cart[p.id] || 0}</span>
            <button onClick={() => add(p.id)}>+</button>
          </div>
        </div>
      ))}

      <div className="col-span-3">
        <button
          onClick={placeOrder}
          className="w-full bg-blue-500 text-white py-3 rounded-xl"
        >
          Đặt hàng
        </button>
      </div>
    </div>
  );
}