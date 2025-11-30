// src/components/Chatbot/RecipesBranch.jsx
import { Plus, Check } from 'lucide-react';
import {useState} from "react";

function RecipeCard({ recipe, isChosen, onAdd }) {
    const [copyIsChosen, setCopyIsChosen] = useState(false)

    return (
        <div className="bg-white/5 border border-white/15 rounded-2xl p-6 backdrop-blur hover:bg-white/10 transition-all">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-white text-xl font-bold">{recipe.name}</h3>

                <button
                    onClick={() => {
                        setCopyIsChosen(true)
                        onAdd()
                    }}
                    className={`p-3 rounded-full transition-all ${
                        (isChosen || copyIsChosen )
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-gray-300'
                    }`}
                >
                    {(copyIsChosen || isChosen) ? (
                        <Check className="w-5 h-5" />
                    ) : (
                        <Plus className="w-5 h-5" />
                    )}
                </button>
            </div>

            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {recipe.instructions}
            </p>

            <div className="text-xs text-yellow-400 font-medium">
                {recipe.macros.calories} ccal • {recipe.macros.protein}g protein •{' '}
                {recipe.macros.fat}g fat • {recipe.macros.carbs}g carbs
            </div>
        </div>
    );
}


export default function RecipesBranch({ recipes, chosenRecipes, onAddRecipe }) {
    const chosenNames = new Set(chosenRecipes.map(r => r.name));

    return (
        <div className="space-y-6">
            <h2 className="text-white text-3xl font-bold">
                Suggested recipes: ({recipes.length})
            </h2>
            {chosenRecipes.length > 0 && (
                <div className="text-emerald-400 font-medium text-lg">
                    Included in plan: {chosenRecipes.length}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recipes.map((r, i) => (
                    <RecipeCard
                        key={i}
                        recipe={r}
                        isChosen={chosenNames.has(r.name)}
                        onAdd={() => onAddRecipe(r)}
                    />
                ))}
            </div>
        </div>
    );
}