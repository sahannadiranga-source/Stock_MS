function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
      <div className="text-xs text-gray-500 mt-2">{hint}</div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="text-lg font-semibold text-gray-900">
          Overview
        </div>
        <div className="text-sm text-gray-600 mt-1">
          This dashboard will show low stock, today’s sales and quick actions.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Low Stock Items" value="—" hint="Will be calculated from inventory ledger" />
        <StatCard title="Today Sales" value="—" hint="Cash + Card totals from POS" />
        <StatCard title="Top Selling" value="—" hint="Most sold items today/this week" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="font-semibold text-gray-900">Quick Actions</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="p-3 rounded-xl border bg-gray-50 hover:bg-gray-100 text-left">
              <div className="font-medium">Add Product</div>
              <div className="text-xs text-gray-500">Create a new item</div>
            </button>
            <button className="p-3 rounded-xl border bg-gray-50 hover:bg-gray-100 text-left">
              <div className="font-medium">New GRN</div>
              <div className="text-xs text-gray-500">Stock in from supplier</div>
            </button>
            <button className="p-3 rounded-xl border bg-gray-50 hover:bg-gray-100 text-left">
              <div className="font-medium">Stock Adjustment</div>
              <div className="text-xs text-gray-500">Fix breakage/wastage</div>
            </button>
            <button className="p-3 rounded-xl border bg-gray-50 hover:bg-gray-100 text-left">
              <div className="font-medium">Open POS</div>
              <div className="text-xs text-gray-500">Start selling</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="font-semibold text-gray-900">Activity</div>
          <div className="text-sm text-gray-600 mt-2">
            Later we’ll show latest sales, GRNs, and adjustments here.
          </div>
          <div className="mt-4 space-y-3">
            <div className="p-3 rounded-xl bg-gray-50 border text-sm text-gray-600">
              No activity yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
