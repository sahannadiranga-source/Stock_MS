import { useAuth } from "../auth/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-12 bg-white border-b flex items-center justify-between px-4">
      <div className="text-xs text-gray-500">
        {user?.username} • {user?.role}
      </div>

      <button
        className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs hover:bg-black transition"
        onClick={logout}
      >
        Logout
      </button>
    </header>
  );
}
