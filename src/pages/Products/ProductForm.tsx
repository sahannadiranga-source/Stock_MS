import { useForm } from "react-hook-form";
import type { Category } from "../../contexts/ProductsContext";

export type ProductFormValues = {
  name: string;
  category: Category;
  
  // Drinks
  bottleSize?: number;
  pricePerBottle?: number;
  pricePer100ml?: number;
  initialBottles?: number;
  
  // Cigarettes
  cigarettesPerPack?: number;
  pricePerPack?: number;
  pricePerCigarette?: number;
  initialPacks?: number;
  
  // Food
  pricePerItem?: number;
  
  imageUrl?: string;
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 mt-1">{msg}</p>;
}

const isDrink = (category: Category) => {
  return ["Arrack", "Whiskey", "Vodka", "Brandy", "Beer", "Wine"].includes(category);
};

export default function ProductForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: initial?.name ?? "",
      category: initial?.category ?? "Arrack",
      bottleSize: initial?.bottleSize,
      pricePerBottle: initial?.pricePerBottle,
      pricePer100ml: initial?.pricePer100ml,
      initialBottles: initial?.initialBottles,
      cigarettesPerPack: initial?.cigarettesPerPack ?? 20,
      pricePerPack: initial?.pricePerPack,
      pricePerCigarette: initial?.pricePerCigarette,
      initialPacks: initial?.initialPacks,
      pricePerItem: initial?.pricePerItem,
      imageUrl: initial?.imageUrl ?? "",
    },
  });

  const category = watch("category");
  const bottleSize = watch("bottleSize");
  const initialBottles = watch("initialBottles");

  const showDrinkFields = isDrink(category);
  const showCigaretteFields = category === "Cigarette";
  const showSoftDrinkFields = category === "Soft Drinks";
  const showFoodFields = category === "Food";

  const totalML = bottleSize && initialBottles ? bottleSize * initialBottles : 0;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl shadow-sm border p-5 space-y-4"
    >
      <div>
        <div className="text-lg font-semibold text-gray-900">
          {initial ? "Edit Product" : "Add Product"}
        </div>
        <div className="text-sm text-gray-500">
          Add items to your inventory. Form adapts based on category.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-700">Product Name *</label>
          <input
            className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            placeholder="e.g., VSOA, Heineken, Marlboro Gold..."
            {...register("name", { required: "Name is required" })}
          />
          <FieldError msg={errors.name?.message} />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium text-gray-700">Category *</label>
          <select
            className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            {...register("category", { required: true })}
          >
            <optgroup label="Drinks">
              <option value="Arrack">Arrack</option>
              <option value="Whiskey">Whiskey</option>
              <option value="Vodka">Vodka</option>
              <option value="Brandy">Brandy</option>
              <option value="Beer">Beer</option>
              <option value="Wine">Wine</option>
            </optgroup>
            <optgroup label="Other">
              <option value="Soft Drinks">Soft Drinks</option>
              <option value="Cigarette">Cigarette</option>
              <option value="Food">Food</option>
            </optgroup>
          </select>
        </div>

        {/* DRINKS FIELDS */}
        {showDrinkFields && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Bottle Size (ml) *</label>
              <input
                type="number"
                className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="750"
                {...register("bottleSize", { 
                  required: "Bottle size is required",
                  valueAsNumber: true,
                  min: 1
                })}
              />
              <FieldError msg={errors.bottleSize?.message} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Initial Stock (Bottles) *</label>
              <input
                type="number"
                className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="100"
                {...register("initialBottles", { 
                  required: "Initial stock is required",
                  valueAsNumber: true,
                  min: 0
                })}
              />
              <FieldError msg={errors.initialBottles?.message} />
            </div>

            {totalML > 0 && (
              <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-sm font-medium text-blue-900">
                  Total Stock: {initialBottles} bottles = {(totalML / 1000).toFixed(2)}L ({totalML.toLocaleString()}ml)
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Price per Bottle (LKR)</label>
              <input
                type="number"
                step="0.01"
                className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="3500"
                {...register("pricePerBottle", { valueAsNumber: true, min: 0 })}
              />
              <p className="text-xs text-gray-500 mt-1">For selling whole bottles</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Price per 100ml (LKR)</label>
              <input
                type="number"
                step="0.01"
                className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="350"
                {...register("pricePer100ml", { valueAsNumber: true, min: 0 })}
              />
              <p className="text-xs text-gray-500 mt-1">For selling by shots/volume</p>
            </div>
          </>
        )}

        {/* CIGARETTE FIELDS */}
        {showCigaretteFields && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Cigarettes per Pack *</label>
              <input
                type="number"
                className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="20"
                {...register("cigarettesPerPack", { 
                  required: "Required",
                  valueAsNumber: true,
                  min: 1
                })}
              />
              <FieldError msg={errors.cigarettesPerPack?.message} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Initial Stock (Packs) *</label>
              <input
                type="number"
                className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="50"
                {...register("initialPacks", { 
                  required: "Initial stock is required",
                  valueAsNumber: true,
                  min: 0
                })}
              />
              <FieldError msg={errors.initialPacks?.message} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Price per Pack (LKR)</label>
              <input
                type="number"
                step="0.01"
                className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="1500"
                {...register("pricePerPack", { valueAsNumber: true, min: 0 })}
              />
              <p className="text-xs text-gray-500 mt-1">For selling whole packs</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Price per Cigarette (LKR)</label>
              <input
                type="number"
                step="0.01"
                className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="75"
                {...register("pricePerCigarette", { valueAsNumber: true, min: 0 })}
              />
              <p className="text-xs text-gray-500 mt-1">For selling loose cigarettes</p>
            </div>
          </>
        )}

        {/* SOFT DRINKS FIELDS */}
        {showSoftDrinkFields && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Initial Stock (Bottles) *</label>
              <input
                type="number"
                className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="100"
                {...register("initialBottles", { 
                  required: "Initial stock is required",
                  valueAsNumber: true,
                  min: 0
                })}
              />
              <FieldError msg={errors.initialBottles?.message} />
              <p className="text-xs text-gray-500 mt-1">Number of bottles in stock</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Price per Bottle (LKR) *</label>
              <input
                type="number"
                step="0.01"
                className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="150"
                {...register("pricePerBottle", { 
                  required: "Price is required",
                  valueAsNumber: true,
                  min: 0
                })}
              />
              <FieldError msg={errors.pricePerBottle?.message} />
              <p className="text-xs text-gray-500 mt-1">Price per bottle</p>
            </div>
          </>
        )}

        {/* FOOD FIELDS */}
        {showFoodFields && (
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Price per Item (LKR) *</label>
            <input
              type="number"
              step="0.01"
              className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="500"
              {...register("pricePerItem", { 
                required: "Price is required",
                valueAsNumber: true,
                min: 0
              })}
            />
            <FieldError msg={errors.pricePerItem?.message} />
            <p className="text-xs text-gray-500 mt-1">Price per plate/serving</p>
          </div>
        )}

        {/* Image URL */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Image URL (optional)</label>
          <input
            className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            placeholder="https://example.com/image.jpg"
            {...register("imageUrl")}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 transition"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black transition"
        >
          Save
        </button>
      </div>
    </form>
  );
}
