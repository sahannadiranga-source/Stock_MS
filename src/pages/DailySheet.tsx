import { useMemo, useState, useEffect, useRef } from "react";
import { useProducts } from "../contexts/ProductsContext";
import type { Category } from "../contexts/ProductsContext";

type DrinkRow = {
  itemId: string;
  previousStock: number; // bottles for beer, ml for liquor
  sold: number | ""; // bottles for beer, ml for liquor
  newStock: number | ""; // bottles for beer, ml for liquor
};

type CigaretteRow = {
  itemId: string;
  previousPacks: number;
  soldPacks: number | "";
  soldLoose: number | ""; // individual cigarettes
  newPacks: number | "";
};

type FoodRow = {
  itemId: string;
  soldCount: number | "";
};

type Expense = {
  id: string;
  description: string;
  amount: number;
};

const money = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(
    isFinite(n) ? n : 0
  );

const isDrink = (category: Category) => {
  return ["Arrack", "Whiskey", "Vodka", "Brandy", "Beer", "Wine"].includes(category);
};

export default function DailySheet() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const { products } = useProducts();

  // Track which products have been synced to avoid duplicates
  const syncedProductIds = useRef(new Set<string>());

  // Load from localStorage
  const [drinkRows, setDrinkRows] = useState<DrinkRow[]>(() => {
    const saved = localStorage.getItem(`dailySheet-drinks-${new Date().toISOString().slice(0, 10)}`);
    const rows = saved ? JSON.parse(saved) : [];
    // Mark loaded items as synced
    rows.forEach((row: DrinkRow) => syncedProductIds.current.add(row.itemId));
    return rows;
  });
  
  const [cigaretteRows, setCigaretteRows] = useState<CigaretteRow[]>(() => {
    const saved = localStorage.getItem(`dailySheet-cigarettes-${new Date().toISOString().slice(0, 10)}`);
    const rows = saved ? JSON.parse(saved) : [];
    // Mark loaded items as synced
    rows.forEach((row: CigaretteRow) => syncedProductIds.current.add(row.itemId));
    return rows;
  });
  
  const [foodRows, setFoodRows] = useState<FoodRow[]>(() => {
    const saved = localStorage.getItem(`dailySheet-food-${new Date().toISOString().slice(0, 10)}`);
    const rows = saved ? JSON.parse(saved) : [];
    // Mark loaded items as synced
    rows.forEach((row: FoodRow) => syncedProductIds.current.add(row.itemId));
    return rows;
  });
  
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`dailySheet-expenses-${new Date().toISOString().slice(0, 10)}`);
    return saved ? JSON.parse(saved) : [{ id: "1", description: "", amount: 0 }];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    const dateKey = date;
    localStorage.setItem(`dailySheet-drinks-${dateKey}`, JSON.stringify(drinkRows));
  }, [drinkRows, date]);

  useEffect(() => {
    const dateKey = date;
    localStorage.setItem(`dailySheet-cigarettes-${dateKey}`, JSON.stringify(cigaretteRows));
  }, [cigaretteRows, date]);

  useEffect(() => {
    const dateKey = date;
    localStorage.setItem(`dailySheet-food-${dateKey}`, JSON.stringify(foodRows));
  }, [foodRows, date]);

  useEffect(() => {
    const dateKey = date;
    localStorage.setItem(`dailySheet-expenses-${dateKey}`, JSON.stringify(expenses));
  }, [expenses, date]);

  // Sync products to rows (only add new products that haven't been synced yet)
  useEffect(() => {
    products.forEach((p) => {
      // Skip if already synced
      if (syncedProductIds.current.has(p.id)) return;
      
      if (isDrink(p.category)) {
        // Beer: track as bottles, Liquor: track as ml
        const isBeer = p.category === "Beer";
        const initialStock = isBeer 
          ? (p.initialBottles || 0) 
          : (p.bottleSize || 0) * (p.initialBottles || 0);
        
        setDrinkRows((prev) => [...prev, {
          itemId: p.id,
          previousStock: initialStock,
          sold: "",
          newStock: "",
        }]);
        syncedProductIds.current.add(p.id);
      } else if (p.category === "Cigarette") {
        setCigaretteRows((prev) => [...prev, {
          itemId: p.id,
          previousPacks: p.initialPacks || 0,
          soldPacks: "",
          soldLoose: "",
          newPacks: "",
        }]);
        syncedProductIds.current.add(p.id);
      } else if (p.category === "Food") {
        setFoodRows((prev) => [...prev, {
          itemId: p.id,
          soldCount: "",
        }]);
        syncedProductIds.current.add(p.id);
      }
    });
  }, [products]);

  const productMap = useMemo(() => {
    return new Map(products.map((p) => [p.id, p]));
  }, [products]);

  // Calculate drinks
  const drinksComputed = useMemo(() => {
    return drinkRows.map((row) => {
      const product = productMap.get(row.itemId);
      if (!product) return null;

      const isBeer = product.category === "Beer";
      const previous = row.previousStock;
      const sold = typeof row.sold === "number" ? row.sold : 0;
      const newStock = typeof row.newStock === "number" ? row.newStock : 0;
      const todayStock = previous - sold + newStock;

      let sellAmount = 0;
      if (isBeer) {
        // Beer: sold as bottles
        if (product.pricePerBottle) {
          sellAmount = sold * product.pricePerBottle;
        }
      } else {
        // Liquor: sold as ml
        if (product.pricePer100ml) {
          sellAmount = (sold / 100) * product.pricePer100ml;
        }
      }

      return {
        product,
        row,
        previous,
        sold,
        newStock,
        todayStock,
        sellAmount,
        isBeer,
      };
    }).filter(Boolean) as any[];
  }, [drinkRows, productMap]);

  // Calculate cigarettes
  const cigarettesComputed = useMemo(() => {
    return cigaretteRows.map((row) => {
      const product = productMap.get(row.itemId);
      if (!product) return null;

      const cigarettesPerPack = product.cigarettesPerPack || 20;
      const previousPacks = row.previousPacks;
      const soldPacks = typeof row.soldPacks === "number" ? row.soldPacks : 0;
      const soldLoose = typeof row.soldLoose === "number" ? row.soldLoose : 0;
      const newPacks = typeof row.newPacks === "number" ? row.newPacks : 0;
      
      // Calculate today's stock in total cigarettes
      const previousTotalCigs = previousPacks * cigarettesPerPack;
      const newTotalCigs = newPacks * cigarettesPerPack;
      const todayTotalCigs = previousTotalCigs - soldPacks * cigarettesPerPack - soldLoose + newTotalCigs;
      
      // Convert to packs and loose
      const todayPacks = Math.floor(todayTotalCigs / cigarettesPerPack);
      const todayLoose = todayTotalCigs % cigarettesPerPack;

      let sellAmount = 0;
      if (product.pricePerPack) {
        sellAmount += soldPacks * product.pricePerPack;
      }
      if (product.pricePerCigarette) {
        sellAmount += soldLoose * product.pricePerCigarette;
      }

      return {
        product,
        row,
        previousPacks,
        soldPacks,
        soldLoose,
        newPacks,
        todayPacks,
        todayLoose,
        todayTotalCigs,
        sellAmount,
      };
    }).filter(Boolean) as any[];
  }, [cigaretteRows, productMap]);

  // Calculate food
  const foodComputed = useMemo(() => {
    return foodRows.map((row) => {
      const product = productMap.get(row.itemId);
      if (!product) return null;

      const soldCount = typeof row.soldCount === "number" ? row.soldCount : 0;
      const sellAmount = soldCount * (product.pricePerItem || 0);

      return {
        product,
        row,
        soldCount,
        sellAmount,
      };
    }).filter(Boolean) as any[];
  }, [foodRows, productMap]);

  const totals = useMemo(() => {
    const drinksSales = drinksComputed.reduce((sum, x) => sum + x.sellAmount, 0);
    const cigarettesSales = cigarettesComputed.reduce((sum, x) => sum + x.sellAmount, 0);
    const foodSales = foodComputed.reduce((sum, x) => sum + x.sellAmount, 0);
    const totalSales = drinksSales + cigarettesSales + foodSales;
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const profit = totalSales - totalExpenses;
    const negativeCount = drinksComputed.filter((x) => x.todayStock < 0).length +
                          cigarettesComputed.filter((x) => x.todayTotalCigs < 0).length;

    return { totalSales, totalExpenses, profit, negativeCount, drinksSales, cigarettesSales, foodSales };
  }, [drinksComputed, cigarettesComputed, foodComputed, expenses]);

  const updateDrinkRow = (itemId: string, patch: Partial<DrinkRow>) => {
    setDrinkRows((prev) => prev.map((r) => (r.itemId === itemId ? { ...r, ...patch } : r)));
  };

  const updateCigaretteRow = (itemId: string, patch: Partial<CigaretteRow>) => {
    setCigaretteRows((prev) => prev.map((r) => (r.itemId === itemId ? { ...r, ...patch } : r)));
  };

  const updateFoodRow = (itemId: string, patch: Partial<FoodRow>) => {
    setFoodRows((prev) => prev.map((r) => (r.itemId === itemId ? { ...r, ...patch } : r)));
  };

  const addExpense = () => {
    setExpenses((prev) => [...prev, { id: `${Date.now()}`, description: "", amount: 0 }]);
  };

  const updateExpense = (id: string, field: "description" | "amount", value: string | number) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const removeExpense = (id: string) => {
    if (expenses.length > 1) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-gray-900">Daily Sheet</div>
          <div className="text-sm text-gray-600">
            Track yesterday's sales and today's stock
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-xl p-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          />
        </div>
      </div>

      {/* Summary Cards - Only at top */}
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
          <div className={`text-2xl font-bold mt-1 ${totals.profit >= 0 ? "text-blue-600" : "text-red-600"}`}>
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

      {/* DRINKS TABLE */}
      {drinksComputed.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-5 py-4 border-b bg-gray-50">
            <div className="font-semibold text-gray-900">Drinks (Arrack, Whiskey, Vodka, Brandy, Beer, Wine)</div>
            <div className="text-sm text-gray-600">Sales: {money(totals.drinksSales)}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Item</th>
                  <th className="text-right p-3">Previous</th>
                  <th className="text-right p-3">Sold</th>
                  <th className="text-right p-3">New Stock</th>
                  <th className="text-right p-3">Today Stock</th>
                  <th className="text-right p-3">Sales Amount</th>
                </tr>
              </thead>
              <tbody>
                {drinksComputed.map((x) => {
                  const unit = x.isBeer ? "bottles" : "ml";
                  return (
                    <tr key={x.product.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {x.product.imageUrl && (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border shrink-0">
                              <img src={x.product.imageUrl} alt={x.product.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{x.product.name}</div>
                            <div className="text-xs text-gray-500">
                              {x.product.category} • {x.product.bottleSize}ml
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        {x.previous.toLocaleString()} <span className="text-xs text-gray-500">{unit}</span>
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          className="w-24 text-right border rounded-lg p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={x.sold}
                          placeholder=""
                          onChange={(e) => updateDrinkRow(x.product.id, { sold: e.target.value === "" ? "" : Number(e.target.value) })}
                        />
                        <div className="text-xs text-gray-500 mt-1">{unit}</div>
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          className="w-24 text-right border rounded-lg p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={x.newStock}
                          placeholder=""
                          onChange={(e) => updateDrinkRow(x.product.id, { newStock: e.target.value === "" ? "" : Number(e.target.value) })}
                        />
                        <div className="text-xs text-gray-500 mt-1">{unit}</div>
                      </td>
                      <td className="p-3 text-right">
                        <span className={x.todayStock < 0 ? "text-red-600 font-bold" : "font-medium"}>
                          {x.todayStock.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">{unit}</span>
                      </td>
                      <td className="p-3 text-right font-semibold">{money(x.sellAmount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CIGARETTES & FOOD TABLE */}
      {(cigarettesComputed.length > 0 || foodComputed.length > 0) && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-5 py-4 border-b bg-gray-50">
            <div className="font-semibold text-gray-900">Cigarettes & Food</div>
            <div className="text-sm text-gray-600">
              Sales: {money(totals.cigarettesSales + totals.foodSales)}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Item</th>
                  <th className="text-right p-3">Previous Stock</th>
                  <th className="text-right p-3">Sold (Packs)</th>
                  <th className="text-right p-3">Sold (Loose)</th>
                  <th className="text-right p-3">New Stock</th>
                  <th className="text-right p-3">Today Stock</th>
                  <th className="text-right p-3">Sales Amount</th>
                </tr>
              </thead>
              <tbody>
                {cigarettesComputed.map((x) => (
                  <tr key={x.product.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {x.product.imageUrl && (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border shrink-0">
                            <img src={x.product.imageUrl} alt={x.product.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{x.product.name}</div>
                          <div className="text-xs text-gray-500">Cigarette • {x.product.cigarettesPerPack}/pack</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div>{x.previousPacks} packs</div>
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        className="w-20 text-right border rounded-lg p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={x.soldPacks}
                        placeholder=""
                        onChange={(e) => updateCigaretteRow(x.product.id, { soldPacks: e.target.value === "" ? "" : Number(e.target.value) })}
                      />
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        placeholder=""
                        className="w-20 text-right border rounded-lg p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={x.soldLoose}
                        onChange={(e) => updateCigaretteRow(x.product.id, { soldLoose: e.target.value === "" ? "" : Number(e.target.value) })}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {x.soldLoose > 0 && `≈ ${(x.soldLoose / (x.product.cigarettesPerPack || 20)).toFixed(2)} packs`}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        className="w-20 text-right border rounded-lg p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={x.newPacks}
                        placeholder=""
                        onChange={(e) => updateCigaretteRow(x.product.id, { newPacks: e.target.value === "" ? "" : Number(e.target.value) })}
                      />
                    </td>
                    <td className="p-3 text-right">
                      <span className={x.todayTotalCigs < 0 ? "text-red-600 font-bold" : "font-medium"}>
                        {x.todayPacks} packs {x.todayLoose} loose
                      </span>
                    </td>
                    <td className="p-3 text-right font-semibold">{money(x.sellAmount)}</td>
                  </tr>
                ))}

                {foodComputed.map((x) => (
                  <tr key={x.product.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {x.product.imageUrl && (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border shrink-0">
                            <img src={x.product.imageUrl} alt={x.product.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{x.product.name}</div>
                          <div className="text-xs text-gray-500">Food</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right text-gray-400">—</td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        className="w-20 text-right border rounded-lg p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={x.soldCount}
                        placeholder=""
                        onChange={(e) => updateFoodRow(x.product.id, { soldCount: e.target.value === "" ? "" : Number(e.target.value) })}
                      />
                    </td>
                    <td className="p-3 text-right text-gray-400">—</td>
                    <td className="p-3 text-right text-gray-400">—</td>
                    <td className="p-3 text-right text-gray-400">—</td>
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
            className="px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-black transition text-sm"
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
                    className="w-full border rounded-lg p-2"
                    placeholder="e.g., Staff salary, Rent..."
                    value={expense.description}
                    onChange={(e) => updateExpense(expense.id, "description", e.target.value)}
                  />
                </td>
                <td className="p-3 text-right">
                  <input
                    type="number"
                    className="w-full text-right border rounded-lg p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={expense.amount || ""}
                    onChange={(e) => updateExpense(expense.id, "amount", Number(e.target.value || 0))}
                  />
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => removeExpense(expense.id)}
                    disabled={expenses.length === 1}
                    className="px-3 py-1.5 rounded-lg border hover:bg-red-50 text-red-600 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            <tr className="border-t bg-gray-50 font-semibold">
              <td className="p-3 text-right">Total:</td>
              <td className="p-3 text-right text-red-600 text-lg">{money(totals.totalExpenses)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
