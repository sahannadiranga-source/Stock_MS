import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../contexts/ProductsContext";
import { useDailySheetData } from "../hooks/useDailySheetData";
import { useDailySheetLock } from "../hooks/useDailySheetLock";
import { useProductSync } from "../hooks/useProductSync";
import { useDailySheetCalculations } from "../hooks/useDailySheetCalculations";
import { useDailySheetActions } from "../hooks/useDailySheetActions";
import { money, formatDrinkStock } from "../utils/dailySheetHelpers";

export default function DailySheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState(() => {
    // Check URL parameter first, otherwise use today
    const urlDate = searchParams.get("date");
    if (urlDate) return urlDate;
    return new Date().toISOString().slice(0, 10);
  });
  const { products } = useProducts();

  // Update URL when date changes
  useEffect(() => {
    setSearchParams({ date }, { replace: true });
  }, [date, setSearchParams]);

  // Custom hooks
  const {
    drinkRows,
    setDrinkRows,
    cigaretteRows,
    setCigaretteRows,
    softDrinkRows,
    setSoftDrinkRows,
    foodRows,
    setFoodRows,
    expenses,
    setExpenses,
    syncedProductIds,
  } = useDailySheetData(date);

  const { isLocked, lockDay, unlockDay, canLock, canUnlock } = useDailySheetLock(date);

  useProductSync(products, syncedProductIds, setDrinkRows, setCigaretteRows, setSoftDrinkRows, setFoodRows);

  const productMap = useMemo(() => {
    return new Map(products.map((p) => [p.id, p]));
  }, [products]);

  const { drinksComputed, cigarettesComputed, softDrinksComputed, foodComputed, totals } =
    useDailySheetCalculations(drinkRows, cigaretteRows, softDrinkRows, foodRows, expenses, productMap);

  const {
    updateDrinkRow,
    updateCigaretteRow,
    updateSoftDrinkRow,
    updateFoodRow,
    addExpense,
    updateExpense,
    removeExpense,
    copyYesterdayToToday,
  } = useDailySheetActions(
    date,
    isLocked,
    products,
    setDrinkRows,
    setCigaretteRows,
    setSoftDrinkRows,
    setFoodRows,
    setExpenses
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-gray-900">Daily Sheet</div>
          <div className="text-sm text-gray-600">Track yesterday's sales and today's stock</div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isLocked && (
            <div className="px-3 py-2 rounded-xl bg-red-100 text-red-700 text-sm font-medium flex items-center gap-2">
              🔒 Locked
            </div>
          )}

          {/* Lock/Unlock buttons - Admin can always see, Cashier only for today */}
          {canLock() && !isLocked && (
            <button
              onClick={lockDay}
              className="px-4 py-2.5 rounded-xl border bg-green-50 border-green-300 text-green-700 hover:bg-green-100 transition text-sm font-medium"
            >
              🔒 Lock Day
            </button>
          )}

          {canUnlock() && isLocked && (
            <button
              onClick={unlockDay}
              className="px-4 py-2.5 rounded-xl border bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100 transition text-sm font-medium"
            >
              🔓 Unlock Day
            </button>
          )}

          <button
            onClick={copyYesterdayToToday}
            disabled={isLocked}
            className="px-4 py-2.5 rounded-xl border bg-white hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Copy yesterday → today
          </button>

          <span className="text-sm text-gray-600">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-xl p-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="text-sm text-gray-500">Total Sales</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{money(totals.totalSales)}</div>
          <div className="text-xs text-gray-500 mt-2">Yesterday's revenue</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="text-sm text-gray-500">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{money(totals.totalExpenses)}</div>
          <div className="text-xs text-gray-500 mt-2">Operational costs</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="text-sm text-gray-500">Net Profit</div>
          <div
            className={`text-2xl font-bold mt-1 ${
              totals.profit >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {money(totals.profit)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Sales - Expenses</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="text-sm text-gray-500">Warnings</div>
          <div className="text-2xl font-bold mt-1">
            <span className={totals.negativeCount > 0 ? "text-red-600" : "text-gray-900"}>
              {totals.negativeCount}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-2">Negative stock items</div>
        </div>
      </div>

      {/* HORIZONTAL LAYOUT - Tables Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* LEFT COLUMN - DRINKS TABLE */}
        {drinksComputed.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden h-fit">
            <div className="px-5 py-4 border-b bg-gray-50">
              <div className="font-semibold text-gray-900">
                Drinks (Arrack, Whiskey, Vodka, Brandy, Beer, Wine)
              </div>
              <div className="text-sm text-gray-600">Sales: {money(totals.drinksSales)}</div>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 xl:p-3">Item</th>
                    <th className="text-right p-2 xl:p-3">Previous</th>
                    <th className="text-right p-2 xl:p-3">Sold</th>
                    <th className="text-right p-2 xl:p-3">New</th>
                    <th className="text-right p-2 xl:p-3">Today</th>
                    <th className="text-right p-2 xl:p-3">Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {drinksComputed.map((x) => {
                    return (
                      <tr key={x.product.id} className="border-t hover:bg-gray-50">
                        <td className="p-2 xl:p-3">
                          <div className="flex items-center gap-2">
                            {x.product.imageUrl && (
                              <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-gray-100 overflow-hidden border shrink-0">
                                <img
                                  src={x.product.imageUrl}
                                  alt={x.product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-xs xl:text-sm">{x.product.name}</div>
                              <div className="text-xs text-gray-500">
                                {x.product.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 xl:p-3 text-right text-xs xl:text-sm">
                          {formatDrinkStock(x.previous, x.product, x.isBottleBased)}
                        </td>
                        <td className="p-2 xl:p-3 text-right">
                          <input
                            type="number"
                            disabled={isLocked}
                            className="w-16 xl:w-20 text-right border rounded-lg p-1 xl:p-2 text-xs xl:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={x.row.sold}
                            onChange={(e) =>
                              updateDrinkRow(x.product.id, {
                                sold: e.target.value === "" ? "" : Number(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="p-2 xl:p-3 text-right">
                          <input
                            type="number"
                            disabled={isLocked}
                            className="w-16 xl:w-20 text-right border rounded-lg p-1 xl:p-2 text-xs xl:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={x.row.newStock}
                            onChange={(e) =>
                              updateDrinkRow(x.product.id, {
                                newStock: e.target.value === "" ? "" : Number(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="p-2 xl:p-3 text-right text-xs xl:text-sm">
                          <span
                            className={x.todayStock < 0 ? "text-red-600 font-bold" : "font-medium"}
                          >
                            {formatDrinkStock(x.todayStock, x.product, x.isBottleBased)}
                          </span>
                        </td>
                        <td className="p-2 xl:p-3 text-right font-semibold text-xs xl:text-sm">{money(x.sellAmount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN - CIGARETTES & SOFT DRINKS TABLE */}
        {(cigarettesComputed.length > 0 || softDrinksComputed.length > 0) && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden h-fit">
          <div className="px-5 py-4 border-b bg-gray-50">
            <div className="font-semibold text-gray-900">Cigarettes & Soft Drinks</div>
            <div className="text-sm text-gray-600">
              Sales: {money(totals.cigarettesSales + totals.softDrinksSales)}
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-2 xl:p-3">Item</th>
                  <th className="text-right p-2 xl:p-3">Previous</th>
                  <th className="text-right p-2 xl:p-3">Sold (P/B)</th>
                  <th className="text-right p-2 xl:p-3">Sold (L)</th>
                  <th className="text-right p-2 xl:p-3">New</th>
                  <th className="text-right p-2 xl:p-3">Today</th>
                  <th className="text-right p-2 xl:p-3">Sales</th>
                </tr>
              </thead>
              <tbody>
                {cigarettesComputed.map((x) => (
                  <tr key={x.product.id} className="border-t hover:bg-gray-50">
                    <td className="p-2 xl:p-3">
                      <div className="flex items-center gap-2">
                        {x.product.imageUrl && (
                          <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-gray-100 overflow-hidden border shrink-0">
                            <img
                              src={x.product.imageUrl}
                              alt={x.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-xs xl:text-sm">{x.product.name}</div>
                          <div className="text-xs text-gray-500">
                            Cigarette
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 xl:p-3 text-right text-xs xl:text-sm">
                      <div>{x.previousPacks}p</div>
                      {x.previousLoose > 0 && (
                        <div className="text-xs text-gray-500">{x.previousLoose}l</div>
                      )}
                    </td>
                    <td className="p-2 xl:p-3 text-right">
                      <input
                        type="number"
                        disabled={isLocked}
                        className="w-14 xl:w-16 text-right border rounded-lg p-1 xl:p-2 text-xs xl:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={x.row.soldPacks}
                        onChange={(e) =>
                          updateCigaretteRow(x.product.id, {
                            soldPacks: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="p-2 xl:p-3 text-right">
                      <input
                        type="number"
                        disabled={isLocked}
                        className="w-14 xl:w-16 text-right border rounded-lg p-1 xl:p-2 text-xs xl:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={x.row.soldLoose}
                        onChange={(e) =>
                          updateCigaretteRow(x.product.id, {
                            soldLoose: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="p-2 xl:p-3 text-right">
                      <input
                        type="number"
                        disabled={isLocked}
                        className="w-14 xl:w-16 text-right border rounded-lg p-1 xl:p-2 text-xs xl:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={x.row.newPacks}
                        onChange={(e) =>
                          updateCigaretteRow(x.product.id, {
                            newPacks: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="p-2 xl:p-3 text-right text-xs xl:text-sm">
                      <span
                        className={
                          x.todayTotalCigs < 0 ? "text-red-600 font-bold" : "font-medium"
                        }
                      >
                        {x.todayPacks}p {x.todayLoose}l
                      </span>
                    </td>
                    <td className="p-2 xl:p-3 text-right font-semibold text-xs xl:text-sm">{money(x.sellAmount)}</td>
                  </tr>
                ))}

                {softDrinksComputed.map((x) => (
                  <tr key={x.product.id} className="border-t hover:bg-gray-50">
                    <td className="p-2 xl:p-3">
                      <div className="flex items-center gap-2">
                        {x.product.imageUrl && (
                          <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-gray-100 overflow-hidden border shrink-0">
                            <img
                              src={x.product.imageUrl}
                              alt={x.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-xs xl:text-sm">{x.product.name}</div>
                          <div className="text-xs text-gray-500">Soft Drink</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 xl:p-3 text-right text-xs xl:text-sm">
                      <div>{x.previousBottles}b</div>
                    </td>
                    <td className="p-2 xl:p-3 text-right">
                      <input
                        type="number"
                        disabled={isLocked}
                        className="w-14 xl:w-16 text-right border rounded-lg p-1 xl:p-2 text-xs xl:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={x.row.soldBottles}
                        onChange={(e) =>
                          updateSoftDrinkRow(x.product.id, {
                            soldBottles: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="p-2 xl:p-3 text-right text-gray-400 text-xs xl:text-sm">—</td>
                    <td className="p-2 xl:p-3 text-right">
                      <input
                        type="number"
                        disabled={isLocked}
                        className="w-14 xl:w-16 text-right border rounded-lg p-1 xl:p-2 text-xs xl:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={x.row.newBottles}
                        onChange={(e) =>
                          updateSoftDrinkRow(x.product.id, {
                            newBottles: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="p-2 xl:p-3 text-right text-xs xl:text-sm">
                      <span
                        className={
                          x.todayBottles < 0 ? "text-red-600 font-bold" : "font-medium"
                        }
                      >
                        {x.todayBottles}b
                      </span>
                    </td>
                    <td className="p-2 xl:p-3 text-right font-semibold text-xs xl:text-sm">{money(x.sellAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {/* SECOND ROW - FOOD TABLE (Full Width) */}
      {foodComputed.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-5 py-4 border-b bg-gray-50">
            <div className="font-semibold text-gray-900">Food</div>
            <div className="text-sm text-gray-600">
              Sales: {money(totals.foodSales)}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Item</th>
                  <th className="text-right p-3">Sold Count</th>
                  <th className="text-right p-3">Sales Amount</th>
                </tr>
              </thead>
              <tbody>
                {foodComputed.map((x) => (
                  <tr key={x.product.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {x.product.imageUrl && (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border shrink-0">
                            <img
                              src={x.product.imageUrl}
                              alt={x.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{x.product.name}</div>
                          <div className="text-xs text-gray-500">Food</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        disabled={isLocked}
                        className="w-20 text-right border rounded-lg p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={x.row.soldCount}
                        onChange={(e) =>
                          updateFoodRow(x.product.id, {
                            soldCount: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="p-3 text-right font-semibold">{money(x.sellAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXPENSES */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="font-semibold text-gray-900">Expenses</div>
          <button
            onClick={addExpense}
            disabled={isLocked}
            className="px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-black transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Description</th>
              <th className="text-right p-3 w-48">Amount (LKR)</th>
              <th className="text-center p-3 w-24">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-t">
                <td className="p-3">
                  <input
                    type="text"
                    disabled={isLocked}
                    className="w-full border rounded-lg p-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., Staff salary, Rent..."
                    value={expense.description}
                    onChange={(e) => updateExpense(expense.id, "description", e.target.value)}
                  />
                </td>
                <td className="p-3 text-right">
                  <input
                    type="number"
                    disabled={isLocked}
                    className="w-full text-right border rounded-lg p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={expense.amount === 0 ? "" : expense.amount}
                    placeholder=""
                    onChange={(e) =>
                      updateExpense(
                        expense.id,
                        "amount",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => removeExpense(expense.id)}
                    disabled={expenses.length === 1 || isLocked}
                    className="px-3 py-1.5 rounded-lg border hover:bg-red-50 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            <tr className="border-t bg-gray-50 font-semibold">
              <td className="p-3 text-right">Total:</td>
              <td className="p-3 text-right text-red-600 text-lg">
                {money(totals.totalExpenses)}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
