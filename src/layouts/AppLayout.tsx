import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="p-3 md:p-4 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
