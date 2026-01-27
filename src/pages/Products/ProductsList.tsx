import { useMemo, useState } from "react";
import ProductForm from "./ProductForm";
import type { ProductFormValues } from "./ProductForm";

type Product = ProductFormValues & { id: number };

const initialProducts: Product[] = [
  { id: 1, name: "Arrack", category: "Liquor", baseUnit: "ml" },
  { id: 2, name: "Heineken", category: "Beer", baseUnit: "pcs" },
];

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => p.name.toLowerCase().includes(s));
  }, [products, q]);

  const startAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setShowForm(true);
  };

  const save = (values: ProductFormValues) => {
    if (editing) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...p, ...values } : p))
      );
    } else {
      const nextId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      setProducts((prev) => [...prev, { id: nextId, ...values }]);
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-gray-900">Products</div>
          <div className="text-sm text-gray-600">
            Manage your liquor, beer, bites, soft drinks and cigarettes.
          </div>
        </div>

        <div className="flex gap-2">
          <input
            className="w-64 max-w-full border rounded-xl p-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            placeholder="Search product..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            onClick={startAdd}
            className="px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-black transition"
          >
            + Add
          </button>
        </div>
      </div>

      {showForm && (
        <ProductForm
          initial={editing ?? undefined}
          onSubmit={save}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Base Unit</th>
              <th className="text-left p-3 w-28">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3 font-medium text-gray-900">{p.name}</td>
                <td className="p-3 text-gray-700">{p.category}</td>
                <td className="p-3 text-gray-700">{p.baseUnit}</td>
                <td className="p-3">
                  <button
                    className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 transition"
                    onClick={() => startEdit(p)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="p-5 text-gray-500" colSpan={4}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
