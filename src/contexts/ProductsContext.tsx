import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type Category = 
  | "Arrack" 
  | "Whiskey" 
  | "Vodka" 
  | "Brandy" 
  | "Beer" 
  | "Wine"
  | "Cigarette" 
  | "Food";

export type Product = {
  id: string;
  name: string;
  category: Category;
  
  // For drinks (Arrack, Whiskey, etc.)
  bottleSize?: number; // ml per bottle
  pricePerBottle?: number;
  pricePer100ml?: number;
  initialBottles?: number;
  
  // For cigarettes
  cigarettesPerPack?: number; // e.g., 20
  pricePerPack?: number;
  pricePerCigarette?: number;
  initialPacks?: number;
  
  // For food
  pricePerItem?: number;
  
  imageUrl?: string;
};

type ProductsContextType = {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  // Load from localStorage
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("products");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<Product, "id">) => {
    const id = `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setProducts((prev) => [...prev, { ...product, id }]);
  };

  const updateProduct = (id: string, product: Omit<Product, "id">) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...product } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within ProductsProvider");
  }
  return context;
}
