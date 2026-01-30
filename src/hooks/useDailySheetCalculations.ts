import { useMemo } from "react";
import type { Product } from "../contexts/ProductsContext";
import type { DrinkRow, CigaretteRow, SoftDrinkRow, FoodRow, Expense } from "./useDailySheetData";

export function useDailySheetCalculations(
  drinkRows: DrinkRow[],
  cigaretteRows: CigaretteRow[],
  softDrinkRows: SoftDrinkRow[],
  foodRows: FoodRow[],
  expenses: Expense[],
  productMap: Map<string, Product>
) {
  const drinksComputed = useMemo(() => {
    return drinkRows
      .map((row) => {
        const product = productMap.get(row.itemId);
        if (!product) return null;

        const isBottleBased = product.category === "Beer";

        const previous = row.previousStock;
        const sold = typeof row.sold === "number" ? row.sold : 0;
        const newStock = typeof row.newStock === "number" ? row.newStock : 0;
        const todayStock = previous - sold + newStock;

        let sellAmount = 0;
        if (isBottleBased) {
          if (product.pricePerBottle) {
            sellAmount = sold * product.pricePerBottle;
          }
        } else {
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
          isBottleBased,
        };
      })
      .filter(Boolean) as any[];
  }, [drinkRows, productMap]);

  const cigarettesComputed = useMemo(() => {
    return cigaretteRows
      .map((row) => {
        const product = productMap.get(row.itemId);
        if (!product) return null;

        const cigarettesPerPack = product.cigarettesPerPack || 20;
        const previousPacks = row.previousPacks;
        const previousLoose = row.previousLoose || 0;
        const soldPacks = typeof row.soldPacks === "number" ? row.soldPacks : 0;
        const soldLoose = typeof row.soldLoose === "number" ? row.soldLoose : 0;
        const newPacks = typeof row.newPacks === "number" ? row.newPacks : 0;

        // Calculate with previousLoose included
        const previousTotalCigs = previousPacks * cigarettesPerPack + previousLoose;
        const newTotalCigs = newPacks * cigarettesPerPack;
        const todayTotalCigs =
          previousTotalCigs - soldPacks * cigarettesPerPack - soldLoose + newTotalCigs;

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
          previousLoose,
          soldPacks,
          soldLoose,
          newPacks,
          todayPacks,
          todayLoose,
          todayTotalCigs,
          sellAmount,
        };
      })
      .filter(Boolean) as any[];
  }, [cigaretteRows, productMap]);

  const softDrinksComputed = useMemo(() => {
    return softDrinkRows
      .map((row) => {
        const product = productMap.get(row.itemId);
        if (!product) return null;

        const previousBottles = row.previousBottles;
        const soldBottles = typeof row.soldBottles === "number" ? row.soldBottles : 0;
        const newBottles = typeof row.newBottles === "number" ? row.newBottles : 0;
        const todayBottles = previousBottles - soldBottles + newBottles;

        let sellAmount = 0;
        if (product.pricePerBottle) {
          sellAmount = soldBottles * product.pricePerBottle;
        }

        return {
          product,
          row,
          previousBottles,
          soldBottles,
          newBottles,
          todayBottles,
          sellAmount,
        };
      })
      .filter(Boolean) as any[];
  }, [softDrinkRows, productMap]);

  const foodComputed = useMemo(() => {
    return foodRows
      .map((row) => {
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
      })
      .filter(Boolean) as any[];
  }, [foodRows, productMap]);

  const totals = useMemo(() => {
    const drinksSales = drinksComputed.reduce((sum, x) => sum + x.sellAmount, 0);
    const cigarettesSales = cigarettesComputed.reduce((sum, x) => sum + x.sellAmount, 0);
    const softDrinksSales = softDrinksComputed.reduce((sum, x) => sum + x.sellAmount, 0);
    const foodSales = foodComputed.reduce((sum, x) => sum + x.sellAmount, 0);
    const totalSales = drinksSales + cigarettesSales + softDrinksSales + foodSales;
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + (typeof e.amount === "number" ? e.amount : 0),
      0
    );

    const profit = totalSales - totalExpenses;
    const negativeCount =
      drinksComputed.filter((x) => x.todayStock < 0).length +
      cigarettesComputed.filter((x) => x.todayTotalCigs < 0).length +
      softDrinksComputed.filter((x) => x.todayBottles < 0).length;

    return {
      totalSales,
      totalExpenses,
      profit,
      negativeCount,
      drinksSales,
      cigarettesSales,
      softDrinksSales,
      foodSales,
    };
  }, [drinksComputed, cigarettesComputed, softDrinksComputed, foodComputed, expenses]);

  return {
    drinksComputed,
    cigarettesComputed,
    softDrinksComputed,
    foodComputed,
    totals,
  };
}
