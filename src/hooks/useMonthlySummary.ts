import { useMemo } from "react";

export type DailySummary = {
  date: string;
  totalSales: number;
  totalExpenses: number;
  profit: number;
  isLocked: boolean;
};

export function useMonthlySummary(year: number, month: number) {
  const monthlySummary = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const summaries: DailySummary[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      // Load data from localStorage
      const drinksRaw = localStorage.getItem(`dailySheet-drinks-${date}`);
      const cigsRaw = localStorage.getItem(`dailySheet-cigarettes-${date}`);
      const foodRaw = localStorage.getItem(`dailySheet-food-${date}`);
      const expensesRaw = localStorage.getItem(`dailySheet-expenses-${date}`);
      const isLocked = localStorage.getItem(`dailySheet-locked-${date}`) === "true";

      if (!drinksRaw && !cigsRaw && !foodRaw) {
        // No data for this day
        continue;
      }

      // Parse expenses
      const expenses = expensesRaw ? JSON.parse(expensesRaw) : [];

      // Calculate totals (simplified - would need product data for accurate pricing)
      // For now, we'll just count items sold
      let totalSales = 0;
      let totalExpenses = 0;

      // Sum expenses
      expenses.forEach((e: any) => {
        if (typeof e.amount === "number") {
          totalExpenses += e.amount;
        }
      });

      // Note: Accurate sales calculation would require product prices
      // This is a placeholder that should be enhanced with actual product data
      
      const profit = totalSales - totalExpenses;

      summaries.push({
        date,
        totalSales,
        totalExpenses,
        profit,
        isLocked,
      });
    }

    return summaries;
  }, [year, month]);

  const monthlyTotals = useMemo(() => {
    const totalSales = monthlySummary.reduce((sum, day) => sum + day.totalSales, 0);
    const totalExpenses = monthlySummary.reduce((sum, day) => sum + day.totalExpenses, 0);
    const totalProfit = totalSales - totalExpenses;
    const lockedDays = monthlySummary.filter((day) => day.isLocked).length;
    const totalDays = monthlySummary.length;

    return {
      totalSales,
      totalExpenses,
      totalProfit,
      lockedDays,
      totalDays,
    };
  }, [monthlySummary]);

  return {
    monthlySummary,
    monthlyTotals,
  };
}
