import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMonthlySummary } from "../hooks/useMonthlySummary";
import { money } from "../utils/dailySheetHelpers";

export default function MonthlySummary() {
  const navigate = useNavigate();
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);

  const { monthlySummary, monthlyTotals } = useMonthlySummary(year, month);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(Number(e.target.value));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(Number(e.target.value));
  };

  const goToDate = (date: string) => {
    navigate(`/daily-sheet?date=${date}`);
  };

  // Generate year options (current year ± 5 years)
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentDate.getFullYear() - 5 + i);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-xl font-semibold text-gray-900">Monthly Summary</div>
            <div className="text-sm text-gray-600">
              View monthly sales, expenses, and profit breakdown
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Month</span>
            <select
              value={month}
              onChange={handleMonthChange}
              className="border rounded-xl p-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleDateString("en-US", { month: "long" })}
                </option>
              ))}
            </select>

            <span className="text-sm text-gray-600">Year</span>
            <select
              value={year}
              onChange={handleYearChange}
              className="border rounded-xl p-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Totals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-2xl shadow-sm border p-4">
          <div className="text-sm text-gray-600">Total Sales</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {money(monthlyTotals.totalSales)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Monthly revenue</div>
        </div>

        <div className="bg-red-50 rounded-2xl shadow-sm border p-4">
          <div className="text-sm text-gray-600">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {money(monthlyTotals.totalExpenses)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Monthly costs</div>
        </div>

        <div className="bg-blue-50 rounded-2xl shadow-sm border p-4">
          <div className="text-sm text-gray-600">Net Profit</div>
          <div
            className={`text-2xl font-bold mt-1 ${
              monthlyTotals.totalProfit >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {money(monthlyTotals.totalProfit)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Sales - Expenses</div>
        </div>

        <div className="bg-purple-50 rounded-2xl shadow-sm border p-4">
          <div className="text-sm text-gray-600">Locked Days</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {monthlyTotals.lockedDays} / {monthlyTotals.totalDays}
          </div>
          <div className="text-xs text-gray-500 mt-2">Days with data</div>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50">
          <div className="font-semibold text-gray-900">
            Daily Breakdown - {new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>
          <div className="text-sm text-gray-600">
            Click on any date to view detailed daily sheet
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-right p-3">Sales</th>
                <th className="text-right p-3">Expenses</th>
                <th className="text-right p-3">Profit</th>
                <th className="text-center p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.map((day) => (
                <tr key={day.date} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <button
                      onClick={() => goToDate(day.date)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </button>
                  </td>
                  <td className="p-3 text-right">{money(day.totalSales)}</td>
                  <td className="p-3 text-right">{money(day.totalExpenses)}</td>
                  <td
                    className={`p-3 text-right font-medium ${
                      day.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {money(day.profit)}
                  </td>
                  <td className="p-3 text-center">
                    {day.isLocked ? (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs">
                        🔒 Locked
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                        Open
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {monthlySummary.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No data available for this month
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
