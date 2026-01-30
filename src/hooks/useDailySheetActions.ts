import type { Product } from "../contexts/ProductsContext";
import type { DrinkRow, CigaretteRow, SoftDrinkRow, FoodRow, Expense } from "./useDailySheetData";

const getYesterday = (yyyyMmDd: string) => {
  const d = new Date(yyyyMmDd);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export function useDailySheetActions(
  date: string,
  isLocked: boolean,
  products: Product[],
  setDrinkRows: React.Dispatch<React.SetStateAction<DrinkRow[]>>,
  setCigaretteRows: React.Dispatch<React.SetStateAction<CigaretteRow[]>>,
  setSoftDrinkRows: React.Dispatch<React.SetStateAction<SoftDrinkRow[]>>,
  setFoodRows: React.Dispatch<React.SetStateAction<FoodRow[]>>,
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>
) {
  const updateDrinkRow = (itemId: string, patch: Partial<DrinkRow>) => {
    if (isLocked) {
      alert("This day is locked. Only Admin can unlock it.");
      return;
    }
    setDrinkRows((prev) => prev.map((r) => (r.itemId === itemId ? { ...r, ...patch } : r)));
  };

  const updateCigaretteRow = (itemId: string, patch: Partial<CigaretteRow>) => {
    if (isLocked) {
      alert("This day is locked. Only Admin can unlock it.");
      return;
    }
    setCigaretteRows((prev) => prev.map((r) => (r.itemId === itemId ? { ...r, ...patch } : r)));
  };

  const updateSoftDrinkRow = (itemId: string, patch: Partial<SoftDrinkRow>) => {
    if (isLocked) {
      alert("This day is locked. Only Admin can unlock it.");
      return;
    }
    setSoftDrinkRows((prev) => prev.map((r) => (r.itemId === itemId ? { ...r, ...patch } : r)));
  };

  const updateFoodRow = (itemId: string, patch: Partial<FoodRow>) => {
    if (isLocked) {
      alert("This day is locked. Only Admin can unlock it.");
      return;
    }
    setFoodRows((prev) => prev.map((r) => (r.itemId === itemId ? { ...r, ...patch } : r)));
  };

  const addExpense = () => {
    if (isLocked) {
      alert("This day is locked. Only Admin can unlock it.");
      return;
    }
    setExpenses((prev) => [...prev, { id: `${Date.now()}`, description: "", amount: "" }]);
  };

  const updateExpense = (
    id: string,
    field: "description" | "amount",
    value: string | number | ""
  ) => {
    if (isLocked) {
      alert("This day is locked. Only Admin can unlock it.");
      return;
    }
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const removeExpense = (id: string) => {
    if (isLocked) {
      alert("This day is locked. Only Admin can unlock it.");
      return;
    }
    if (setExpenses) {
      setExpenses((prev) => (prev.length > 1 ? prev.filter((e) => e.id !== id) : prev));
    }
  };

  const getCigsPerPack = (itemId: string) => {
    const p = products.find((x) => x.id === itemId);
    return p?.cigarettesPerPack || 20;
  };

  const copyYesterdayToToday = () => {
    if (isLocked) {
      alert("This day is locked. Unlock it first to make changes.");
      return;
    }

    const y = getYesterday(date);

    const yDrinksRaw = localStorage.getItem(`dailySheet-drinks-${y}`);
    const yCigsRaw = localStorage.getItem(`dailySheet-cigarettes-${y}`);
    const ySoftDrinksRaw = localStorage.getItem(`dailySheet-softdrinks-${y}`);
    const yExpensesRaw = localStorage.getItem(`dailySheet-expenses-${y}`);

    const yDrinks: DrinkRow[] = yDrinksRaw ? JSON.parse(yDrinksRaw) : [];
    const yCigs: CigaretteRow[] = yCigsRaw ? JSON.parse(yCigsRaw) : [];
    const ySoftDrinks: SoftDrinkRow[] = ySoftDrinksRaw ? JSON.parse(ySoftDrinksRaw) : [];
    const yExpenses: Expense[] = yExpensesRaw ? JSON.parse(yExpensesRaw) : [];

    if (yDrinks.length === 0 && yCigs.length === 0 && ySoftDrinks.length === 0) {
      alert(`No data found for ${y}. Cannot copy.`);
      return;
    }

    // Drinks: copy closing stock -> today previousStock, reset sold/newStock
    setDrinkRows((today) => {
      const map = new Map(yDrinks.map((r) => [r.itemId, r]));

      // If today has no rows yet, create them from yesterday's data
      if (today.length === 0 && yDrinks.length > 0) {
        return yDrinks.map((yRow) => {
          const ySold = typeof yRow.sold === "number" ? yRow.sold : 0;
          const yNew = typeof yRow.newStock === "number" ? yRow.newStock : 0;
          const closing = yRow.previousStock - ySold + yNew;

          return {
            itemId: yRow.itemId,
            previousStock: closing,
            sold: "",
            newStock: "",
          };
        });
      }

      return today.map((t) => {
        const yRow = map.get(t.itemId);
        if (!yRow) {
          return { ...t, sold: "", newStock: "" };
        }

        const ySold = typeof yRow.sold === "number" ? yRow.sold : 0;
        const yNew = typeof yRow.newStock === "number" ? yRow.newStock : 0;
        const closing = yRow.previousStock - ySold + yNew;

        return {
          ...t,
          previousStock: closing,
          sold: "",
          newStock: "",
        };
      });
    });

    // Cigarettes: copy closing packs+loose -> today previousPacks+previousLoose, reset sold/newPacks
    setCigaretteRows((today) => {
      const map = new Map(yCigs.map((r) => [r.itemId, r]));

      // If today has no rows yet, create them from yesterday's data
      if (today.length === 0 && yCigs.length > 0) {
        return yCigs.map((yRow) => {
          const perPack = getCigsPerPack(yRow.itemId);

          const yPreviousPacks = yRow.previousPacks || 0;
          const yPreviousLoose = yRow.previousLoose || 0;
          const ySoldPacks = typeof yRow.soldPacks === "number" ? yRow.soldPacks : 0;
          const ySoldLoose = typeof yRow.soldLoose === "number" ? yRow.soldLoose : 0;
          const yNewPacks = typeof yRow.newPacks === "number" ? yRow.newPacks : 0;

          const prevTotal = yPreviousPacks * perPack + yPreviousLoose;
          const newTotal = yNewPacks * perPack;
          const closingTotal = prevTotal - ySoldPacks * perPack - ySoldLoose + newTotal;

          const closingPacks = Math.floor(closingTotal / perPack);
          const closingLoose = closingTotal % perPack;

          return {
            itemId: yRow.itemId,
            previousPacks: closingPacks < 0 ? 0 : closingPacks,
            previousLoose: closingTotal < 0 ? 0 : closingLoose,
            soldPacks: "",
            soldLoose: "",
            newPacks: "",
          };
        });
      }

      return today.map((t) => {
        const yRow = map.get(t.itemId);
        if (!yRow) {
          return { ...t, soldPacks: "", soldLoose: "", newPacks: "" };
        }

        const perPack = getCigsPerPack(t.itemId);

        const yPreviousPacks = yRow.previousPacks || 0;
        const yPreviousLoose = yRow.previousLoose || 0;
        const ySoldPacks = typeof yRow.soldPacks === "number" ? yRow.soldPacks : 0;
        const ySoldLoose = typeof yRow.soldLoose === "number" ? yRow.soldLoose : 0;
        const yNewPacks = typeof yRow.newPacks === "number" ? yRow.newPacks : 0;

        // Calculate yesterday's closing total in cigarettes
        const prevTotal = yPreviousPacks * perPack + yPreviousLoose;
        const newTotal = yNewPacks * perPack;
        const closingTotal = prevTotal - ySoldPacks * perPack - ySoldLoose + newTotal;

        const closingPacks = Math.floor(closingTotal / perPack);
        const closingLoose = closingTotal % perPack;

        return {
          ...t,
          previousPacks: closingPacks < 0 ? 0 : closingPacks,
          previousLoose: closingTotal < 0 ? 0 : closingLoose,
          soldPacks: "",
          soldLoose: "",
          newPacks: "",
        };
      });
    });

    // Soft Drinks: copy closing bottles -> today previousBottles, reset sold/newBottles
    setSoftDrinkRows((today) => {
      const map = new Map(ySoftDrinks.map((r) => [r.itemId, r]));

      // If today has no rows yet, create them from yesterday's data
      if (today.length === 0 && ySoftDrinks.length > 0) {
        return ySoftDrinks.map((yRow) => {
          const ySold = typeof yRow.soldBottles === "number" ? yRow.soldBottles : 0;
          const yNew = typeof yRow.newBottles === "number" ? yRow.newBottles : 0;
          const closing = yRow.previousBottles - ySold + yNew;

          return {
            itemId: yRow.itemId,
            previousBottles: closing < 0 ? 0 : closing,
            soldBottles: "",
            newBottles: "",
          };
        });
      }

      return today.map((t) => {
        const yRow = map.get(t.itemId);
        if (!yRow) {
          return { ...t, soldBottles: "", newBottles: "" };
        }

        const ySold = typeof yRow.soldBottles === "number" ? yRow.soldBottles : 0;
        const yNew = typeof yRow.newBottles === "number" ? yRow.newBottles : 0;
        const closing = yRow.previousBottles - ySold + yNew;

        return {
          ...t,
          previousBottles: closing < 0 ? 0 : closing,
          soldBottles: "",
          newBottles: "",
        };
      });
    });

    // Food: Reset soldCount for new day, but ensure all food items from yesterday are present
    setFoodRows((today) => {
      const yFoodRaw = localStorage.getItem(`dailySheet-food-${y}`);
      const yFood: FoodRow[] = yFoodRaw ? JSON.parse(yFoodRaw) : [];

      // Start with today's rows, reset soldCount
      const updatedToday = today.map((t) => ({
        ...t,
        soldCount: "" as const,
      }));

      // Add any food items from yesterday that don't exist in today
      const todayIds = new Set(updatedToday.map(r => r.itemId));
      const missingFromYesterday = yFood.filter(yRow => !todayIds.has(yRow.itemId));
      
      return [
        ...updatedToday,
        ...missingFromYesterday.map(yRow => ({
          itemId: yRow.itemId,
          soldCount: "" as const,
        }))
      ];
    });

    // Expenses: copy yesterday expenses to today
    if (yExpenses.length > 0) {
      setExpenses(yExpenses);
    }

    alert(
      `✅ Copied from ${y} to ${date}\n• Drinks: Closing stock → Previous\n• Cigarettes: Closing packs+loose → Previous\n• Soft Drinks: Closing bottles → Previous\n• Food: Reset (empty)\n• Expenses: Copied`
    );
  };

  return {
    updateDrinkRow,
    updateCigaretteRow,
    updateSoftDrinkRow,
    updateFoodRow,
    addExpense,
    updateExpense,
    removeExpense,
    copyYesterdayToToday,
  };
}
