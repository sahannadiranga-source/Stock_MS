import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./auth/AuthContext";
import { ProductsProvider } from "./contexts/ProductsContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ProductsProvider>
        <AppRoutes />
      </ProductsProvider>
    </AuthProvider>
  </React.StrictMode>
);
