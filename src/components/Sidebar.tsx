import { NavLink } from "react-router-dom";

const base =
  "flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition";
const idle = "text-gray-300 hover:bg-white/10 hover:text-white";
const active = "bg-white/10 text-white";

export default function Sidebar() {
  return (
    <aside className="w-44 bg-gray-900 text-white flex flex-col shrink-0">
      <div className="px-3 py-4 border-b border-white/10">
        <div className="text-base font-semibold">Stock</div>
        <div className="text-xs text-gray-400 mt-1">Admin</div>
      </div>

      <nav className="p-2 space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${base} ${isActive ? active : idle}`}
        >
          <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
          <span className="truncate">Daily Sheet</span>
        </NavLink>

        <NavLink
          to="/monthly-summary"
          className={({ isActive }) => `${base} ${isActive ? active : idle}`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
          <span className="truncate">Monthly</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) => `${base} ${isActive ? active : idle}`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
          <span className="truncate">Products</span>
        </NavLink>
      </nav>


    </aside>
  );
}
