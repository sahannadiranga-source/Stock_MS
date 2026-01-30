import { useState, useEffect, useRef } from "react";

export type DrinkRow = {
  itemId: string;
  previousStock: number;
  sold: number | "";
  newStock: number | "";
};

export type CigaretteRow = {
  itemId: string;
  previousPacks: number;
  previousLoose: number; // Store loose cigarettes from yesterday
  soldPacks: number | "";
  soldLoose: number | "";
  newPacks: number | "";
};

export type SoftDrinkRow = {
  itemId: string;
  previousBottles: number;
  soldBottles: number | "";
  newBottles: number | "";
};

export type FoodRow = {
  itemId: string;
  soldCount: number | "";
};

export type Expense = {
  id: string;
  description: string;
  amount: number | "";
};

export function useDailySheetData(date: string) {
  const syncedProductIds = useRef(new Set<string>());

  const [drinkRows, setDrinkRows] = useState<DrinkRow[]>(() => {
    const saved = localStorage.getItem(`dailySheet-drinks-${new Date().toISOString().slice(0, 10)}`);
    const rows = saved ? JSON.parse(saved) : [];
    rows.forEach((row: DrinkRow) => syncedProductIds.current.add(row.itemId));
    return rows;
  });

  const [cigaretteRows, setCigaretteRows] = useState<CigaretteRow[]>(() => {
    const saved = localStorage.getItem(`dailySheet-cigarettes-${new Date().toISOString().slice(0, 10)}`);
    const rows = saved ? JSON.parse(saved) : [];
    rows.forEach((row: CigaretteRow) => syncedProductIds.current.add(row.itemId));
    return rows;
  });

  const [softDrinkRows, setSoftDrinkRows] = useState<SoftDrinkRow[]>(() => {
    const saved = localStorage.getItem(`dailySheet-softdrinks-${new Date().toISOString().slice(0, 10)}`);
    const rows = saved ? JSON.parse(saved) : [];
    rows.forEach((row: SoftDrinkRow) => syncedProductIds.current.add(row.itemId));
    return rows;
  });

  const [foodRows, setFoodRows] = useState<FoodRow[]>(() => {
    const saved = localStorage.getItem(`dailySheet-food-${new Date().toISOString().slice(0, 10)}`);
    const rows = saved ? JSON.parse(saved) : [];
    rows.forEach((row: FoodRow) => syncedProductIds.current.add(row.itemId));
    return rows;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`dailySheet-expenses-${new Date().toISOString().slice(0, 10)}`);
    return saved ? JSON.parse(saved) : [{ id: "1", description: "", amount: "" }];
  });

  // When date changes, load that date's data
  useEffect(() => {
    syncedProductIds.current = new Set<string>();

    const drinks = localStorage.getItem(`dailySheet-drinks-${date}`);
    const cigs = localStorage.getItem(`dailySheet-cigarettes-${date}`);
    const softDrinks = localStorage.getItem(`dailySheet-softdrinks-${date}`);
    const food = localStorage.getItem(`dailySheet-food-${date}`);
    const exp = localStorage.getItem(`dailySheet-expenses-${date}`);

    const loadedDrinks: DrinkRow[] = drinks ? JSON.parse(drinks) : [];
    const loadedCigs: CigaretteRow[] = cigs ? JSON.parse(cigs) : [];
    const loadedSoftDrinks: SoftDrinkRow[] = softDrinks ? JSON.parse(softDrinks) : [];
    const loadedFood: FoodRow[] = food ? JSON.parse(food) : [];

    loadedDrinks.forEach((r) => syncedProductIds.current.add(r.itemId));
    loadedCigs.forEach((r) => syncedProductIds.current.add(r.itemId));
    loadedSoftDrinks.forEach((r) => syncedProductIds.current.add(r.itemId));
    loadedFood.forEach((r) => syncedProductIds.current.add(r.itemId));

    setDrinkRows(loadedDrinks);
    setCigaretteRows(loadedCigs);
    setSoftDrinkRows(loadedSoftDrinks);
    setFoodRows(loadedFood);
    setExpenses(exp ? JSON.parse(exp) : [{ id: "1", description: "", amount: "" }]);
  }, [date]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(`dailySheet-drinks-${date}`, JSON.stringify(drinkRows));
  }, [drinkRows, date]);

  useEffect(() => {
    localStorage.setItem(`dailySheet-cigarettes-${date}`, JSON.stringify(cigaretteRows));
  }, [cigaretteRows, date]);

  useEffect(() => {
    localStorage.setItem(`dailySheet-softdrinks-${date}`, JSON.stringify(softDrinkRows));
  }, [softDrinkRows, date]);

  useEffect(() => {
    localStorage.setItem(`dailySheet-food-${date}`, JSON.stringify(foodRows));
  }, [foodRows, date]);

  useEffect(() => {
    localStorage.setItem(`dailySheet-expenses-${date}`, JSON.stringify(expenses));
  }, [expenses, date]);

  return {
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
  };
}
