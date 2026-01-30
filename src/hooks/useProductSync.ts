import { useEffect, type MutableRefObject } from "react";
import type { Product } from "../contexts/ProductsContext";
import type { DrinkRow, CigaretteRow, SoftDrinkRow, FoodRow } from "./useDailySheetData";

const isDrink = (category: string) => {
  return [
    "Arrack",
    "Whiskey",
    "Vodka",
    "Brandy",
    "Beer",
    "Wine",
  ].includes(category);
};

export function useProductSync(
  products: Product[],
  syncedProductIds: MutableRefObject<Set<string>>,
  setDrinkRows: React.Dispatch<React.SetStateAction<DrinkRow[]>>,
  setCigaretteRows: React.Dispatch<React.SetStateAction<CigaretteRow[]>>,
  setSoftDrinkRows: React.Dispatch<React.SetStateAction<SoftDrinkRow[]>>,
  setFoodRows: React.Dispatch<React.SetStateAction<FoodRow[]>>
) {
  useEffect(() => {
    // Ensure ALL products from the product list are present in the daily sheet
    // This handles both new products and ensures consistency across all dates
    
    products.forEach((p) => {
      if (syncedProductIds.current.has(p.id)) return;

      if (isDrink(p.category)) {
        const isBottleBased = p.category === "Beer";
        const initialStock = isBottleBased
          ? (p.initialBottles || 0)
          : (p.bottleSize || 0) * (p.initialBottles || 0);

        setDrinkRows((prev) => {
          // Check if already exists
          if (prev.some(row => row.itemId === p.id)) return prev;
          
          return [
            ...prev,
            {
              itemId: p.id,
              previousStock: initialStock,
              sold: "",
              newStock: "",
            },
          ];
        });
        syncedProductIds.current.add(p.id);
      } else if (p.category === "Cigarette") {
        setCigaretteRows((prev) => {
          // Check if already exists
          if (prev.some(row => row.itemId === p.id)) return prev;
          
          return [
            ...prev,
            {
              itemId: p.id,
              previousPacks: p.initialPacks || 0,
              previousLoose: 0,
              soldPacks: "",
              soldLoose: "",
              newPacks: "",
            },
          ];
        });
        syncedProductIds.current.add(p.id);
      } else if ((p.category as string) === "Soft Drinks") {
        setSoftDrinkRows((prev) => {
          // Check if already exists
          if (prev.some(row => row.itemId === p.id)) return prev;
          
          return [
            ...prev,
            {
              itemId: p.id,
              previousBottles: p.initialBottles || 0,
              soldBottles: "",
              newBottles: "",
            },
          ];
        });
        syncedProductIds.current.add(p.id);
      } else if (p.category === "Food") {
        setFoodRows((prev) => {
          // Check if already exists
          if (prev.some(row => row.itemId === p.id)) return prev;
          
          return [
            ...prev,
            {
              itemId: p.id,
              soldCount: "",
            },
          ];
        });
        syncedProductIds.current.add(p.id);
      }
    });
  }, [products, syncedProductIds, setDrinkRows, setCigaretteRows, setSoftDrinkRows, setFoodRows]);
}
