import { useMemo, useState } from "react";
import ProductForm from "./ProductForm";
import type { ProductFormValues } from "./ProductForm";
import { useProducts } from "../../contexts/ProductsContext";

export default function ProductsList() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<{ id: string; data: ProductFormValues } | null>(null);
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

  const startEdit = (p: typeof products[0]) => {
    setEditing({ id: p.id, data: p });
    setShowForm(true);
  };

  const save = (values: ProductFormValues) => {
    if (editing) {
      updateProduct(editing.id, values);
    } else {
      addProduct(values);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-gray-900">Products</div>
          <div className="text-sm text-gray-600">
            Manage your inventory: Drinks, Cigarettes, and Food items
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
            + Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <ProductForm
          initial={editing?.data}
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
              <th className="text-right p-3">Pricing</th>
              <th className="text-center p-3 w-32">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.imageUrl && (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border shrink-0">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="font-medium text-gray-900">{p.name}</div>
                  </div>
                </td>
                <td className="p-3 text-gray-700">{p.category}</td>
                <td className="p-3 text-right text-gray-700">
                  <div className="space-y-1">
                    {p.pricePerBottle && (
                      <div className="text-xs">{new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(p.pricePerBottle)}/bottle</div>
                    )}
                    {p.pricePer100ml && (
                      <div className="text-xs">{new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(p.pricePer100ml)}/100ml</div>
                    )}
                    {p.pricePerPack && (
                      <div className="text-xs">{new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(p.pricePerPack)}/pack</div>
                    )}
                    {p.pricePerCigarette && (
                      <div className="text-xs">{new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(p.pricePerCigarette)}/cig</div>
                    )}
                    {p.pricePerItem && (
                      <div className="text-xs">{new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(p.pricePerItem)}/item</div>
                    )}
                  </div>
                </td>
                <td className="p-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 transition text-sm"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg border border-red-300 bg-white hover:bg-red-50 transition text-sm text-red-600"
                      onClick={() => handleDelete(p.id, p.name)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="p-8 text-center text-gray-500" colSpan={4}>
                  No products found. Click "+ Add Product" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
