// src/components/DishToShop/AnalyzedDishView.jsx
import DishPhoto from './DishPhoto';
import RecipeDetails from './RecipeDetails';
import ShoppingListGrid from './ShoppingListGrid';

export default function AnalyzedDishView({ photoUrl, analysis }) {
  // Safety first – always have defaults
  const dish = analysis?.recognized_dish || "Unknown dish";
  const serves = analysis?.serves || "?";
  const ingredients = analysis?.ingredients || [];
  const shoppingList = analysis?.shopping_list || { items: [], estimated_total: 0, currency: "€" };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-5 space-y-8">
          <DishPhoto url={photoUrl} dishName={dish} />
          <RecipeDetails dish={{ ...analysis, serves }} />
        </div>
        
        {/* Right column – shopping list */}
        <div className="lg:col-span-7">
          <ShoppingListGrid shoppingList={shoppingList} />
        </div>
      </div>
    </div>
  );
}