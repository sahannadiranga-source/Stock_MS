export const money = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(
    isFinite(n) ? n : 0
  );

export const formatDrinkStock = (total: number, product: any, isBottleBased: boolean) => {
  if (isBottleBased) {
    // Beer: just show bottles
    return (
      <div>
        <div className="font-medium">{total.toLocaleString()} bottles</div>
      </div>
    );
  }

  // Liquor: show ml (bold) and exact bottles (small gray text)
  const size = product.bottleSize || 0;
  if (!size) {
    return (
      <div>
        <div className="font-medium">{total.toLocaleString()} ml</div>
      </div>
    );
  }

  const exactBottles = (total / size).toFixed(2);

  return (
    <div>
      <div className="font-medium">{total.toLocaleString()} ml</div>
      <div className="text-xs text-gray-500">{exactBottles} bottles</div>
    </div>
  );
};
