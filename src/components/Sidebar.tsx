import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }: any) =>
    `p-2 rounded transition ${
      isActive
        ? "bg-blue-500 text-white"
        : "hover:bg-gray-100 text-gray-700"
    }`;

  return (
    <div className="w-60 bg-white shadow p-4 flex flex-col gap-4">

      {/* TITLE */}
      <h1 className="font-bold text-lg">🚚 LOGISTICS</h1>

      {/* NAV */}
      <nav className="flex flex-col gap-2">

        <NavLink to="/" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/tracking" className={linkClass}>
          Tracking
        </NavLink>

        <NavLink to="/routes" className={linkClass}>
          Routes
        </NavLink>

        <NavLink to="/drivers" className={linkClass}>
          Drivers
        </NavLink>

        {/* 🔥 THÊM PAGE ORDERS */}
        <NavLink to="/orders" className={linkClass}>
          Orders
        </NavLink>

      </nav>
    </div>
  );
}