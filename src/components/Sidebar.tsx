import { NavLink } from "react-router-dom";

const base =
  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition";
const idle = "text-gray-300 hover:bg-white/10 hover:text-white";
const active = "bg-white/10 text-white";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="px-4 py-4 border-b border-white/10">
        <div className="text-lg font-semibold">Restaurant Stock</div>
        <div className="text-xs text-gray-400 mt-1">Admin Panel</div>
      </div>

      <nav className="p-3 space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${base} ${isActive ? active : idle}`}
        >
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Dashboard
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) => `${base} ${isActive ? active : idle}`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          Products
        </NavLink>

        <div className="mt-4 px-3 text-xs text-gray-400 uppercase tracking-wider">
          Coming soon
        </div>

        <div className="px-3 py-2 text-sm text-gray-500">Stock</div>
        <div className="px-3 py-2 text-sm text-gray-500">Sales (POS)</div>
        <div className="px-3 py-2 text-sm text-gray-500">Reports</div>
      </nav>

      <div className="mt-auto p-3 border-t border-white/10">
        <div className="text-xs text-gray-400">
          v0.1 • React + .NET + PostgreSQL
        </div>
      </div>
    </aside>
  );
}
