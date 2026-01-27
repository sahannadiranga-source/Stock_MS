import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("1234");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
    nav("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded-2xl shadow-sm border w-full max-w-sm">
        <div className="text-xl font-semibold text-gray-900">Login</div>
        <div className="text-sm text-gray-600 mt-1">Sign in to manage stock & sales</div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700">Username</label>
          <input
            className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mt-3">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="w-full mt-5 px-4 py-3 rounded-xl bg-gray-900 text-white hover:bg-black transition">
          Sign in
        </button>

        <div className="text-xs text-gray-500 mt-3">
          (Mock login for now. Later connect to .NET API.)
        </div>
      </form>
    </div>
  );
}
