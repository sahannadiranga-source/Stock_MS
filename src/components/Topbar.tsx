import { useAuth } from "../auth/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-4">
      <div>
        <div className="text-sm font-semibold text-gray-900">Dashboard</div>
        <div className="text-xs text-gray-500">Manage products, stock and sales</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">{user?.username}</div>
          <div className="text-xs text-gray-500">{user?.role}</div>
        </div>

        <button
          className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-black transition"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
