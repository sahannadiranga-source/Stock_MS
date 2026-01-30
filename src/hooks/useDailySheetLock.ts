import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

export function useDailySheetLock(date: string) {
  const { user } = useAuth();
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const locked = localStorage.getItem(`dailySheet-locked-${date}`);
    setIsLocked(locked === "true");
  }, [date]);

  const lockDay = () => {
    const today = new Date().toISOString().slice(0, 10);
    const isToday = date === today;

    // Cashier can only lock today, Admin can lock any day
    if (user?.role === "Cashier" && !isToday) {
      alert("Cashiers can only lock today's sheet");
      return;
    }

    if (user?.role !== "Admin" && user?.role !== "Cashier") {
      alert("Only Admin or Cashier can lock days");
      return;
    }

    localStorage.setItem(`dailySheet-locked-${date}`, "true");
    setIsLocked(true);
    alert(`${date} is now locked and cannot be edited`);
  };

  const unlockDay = () => {
    if (user?.role !== "Admin") {
      alert("Only Admin can unlock days");
      return;
    }
    localStorage.removeItem(`dailySheet-locked-${date}`);
    setIsLocked(false);
    alert(`${date} is now unlocked`);
  };

  const canLock = () => {
    const today = new Date().toISOString().slice(0, 10);
    const isToday = date === today;
    return user?.role === "Admin" || (user?.role === "Cashier" && isToday);
  };

  const canUnlock = () => {
    return user?.role === "Admin";
  };

  return { isLocked, lockDay, unlockDay, canLock, canUnlock };
}
