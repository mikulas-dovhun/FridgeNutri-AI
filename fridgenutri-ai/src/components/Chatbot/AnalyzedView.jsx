// src/components/Chatbot/AnalyzedView.jsx
import FridgePhoto from './FridgePhoto';
import IngredientsGrid from './IngredientsGrid';
import RecipesBranch from './RecipesBranch';

export default function AnalyzedView({ photoUrl, ingredients, recipes, chosenRecipes, onAddRecipe }) {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-8">
                    <FridgePhoto url={photoUrl} />
                    <IngredientsGrid ingredients={ingredients} />
                </div>
                <div className="lg:col-span-7">
                    <RecipesBranch
                        recipes={recipes}
                        chosenRecipes={chosenRecipes}
                        onAddRecipe={onAddRecipe}
                    />
                </div>
            </div>
        </div>
    );
}