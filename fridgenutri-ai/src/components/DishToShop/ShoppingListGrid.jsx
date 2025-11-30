// src/components/DishToShop/ShoppingListGrid.jsx
import { ShoppingCart } from 'lucide-react';

export default function ShoppingListGrid({ shoppingList }) {
  const items = Array.isArray(shoppingList?.items) ? shoppingList.items : [];
  const total = shoppingList?.estimated_total ?? 0;
  const currency = shoppingList?.currency ?? "€";
  const note = shoppingList?.note || "Real-time prices from Slovak shops";
  
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        No ingredients found or prices are being loaded…
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-emerald-400" />
        <h2 className="text-3xl font-bold">Shopping List</h2>
      </div>
      
      <div className="bg-white/5 border border-white/15 rounded-3xl p-8 backdrop-blur">
        <div className="space-y-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-4 border-b border-white/10 last:border-0"
            >
              <div>
                <div className="text-white font-medium">{item.item || "Unknown"}</div>
                <div className="text-sm text-gray-400">{item.amount || ""}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-emerald-400">
                  {item.price && item.price !== "—" ? item.price : "—"}
                </div>
                <div className="text-xs text-gray-400">{item.store || ""}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t-2 border-emerald-500/30">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">Total</span>
            <span className="text-4xl font-bold text-emerald-400">
              {total > 0 ? `${total.toFixed(2)} ${currency}` : "—"}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">{note}</p>
        </div>
      </div>
    </div>
  );
}