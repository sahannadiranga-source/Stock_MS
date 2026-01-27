import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  category: z.enum(["Liquor", "Beer", "Bites", "SoftDrink", "Cigarette", "Other"]),
  baseUnit: z.enum(["ml", "pcs"]),
});

export type ProductFormValues = z.infer<typeof schema>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 mt-1">{msg}</p>;
}

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
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      category: (initial?.category as any) ?? "Liquor",
      baseUnit: (initial?.baseUnit as any) ?? "ml",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl shadow-sm border p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {initial ? "Edit Product" : "Add Product"}
          </div>
          <div className="text-sm text-gray-500">
            Create your menu/stock items. Liquor should use base unit ml.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            placeholder="Arrack / Heineken / Chicken Devil..."
            {...register("name")}
          />
          <FieldError msg={errors.name?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Base Unit</label>
          <select
            className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            {...register("baseUnit")}
          >
            <option value="ml">ml</option>
            <option value="pcs">pcs</option>
          </select>
          <FieldError msg={errors.baseUnit?.message} />
        </div>

        <div className="md:col-span-3">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            {...register("category")}
          >
            <option value="Liquor">Liquor</option>
            <option value="Beer">Beer</option>
            <option value="Bites">Bites</option>
            <option value="SoftDrink">Soft Drink</option>
            <option value="Cigarette">Cigarette</option>
            <option value="Other">Other</option>
          </select>
          <FieldError msg={errors.category?.message} />
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
