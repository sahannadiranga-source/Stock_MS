import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ProductsList from "../pages/Products/ProductsList";
import Login from "../pages/Login";
import RequireAuth from "../auth/RequireAuth";
import DailySheet from "../pages/DailySheet";
import MonthlySummary from "../pages/MonthlySummary";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DailySheet />} />
          <Route path="daily-sheet" element={<Navigate to="/" replace />} />
          <Route path="monthly-summary" element={<MonthlySummary />} />
          <Route path="products" element={<ProductsList />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
