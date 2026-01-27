import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout() {
  const loc = useLocation();

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Topbar title changes later; for now it’s static */}
        <Topbar />
        <main className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* breadcrumb-ish */}
            <div className="text-xs text-gray-500 mb-3">
              Path: <span className="font-mono">{loc.pathname}</span>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
