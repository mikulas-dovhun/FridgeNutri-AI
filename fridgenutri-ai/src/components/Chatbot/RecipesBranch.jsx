// src/components/Chatbot/RecipesBranch.jsx
import { Plus, Check, X } from 'lucide-react';
import { useState } from 'react';

// какие микро-нутриенты показываем
const MICRO_CONFIG = [
    { key: 'vitamin_A_mg', label: 'Vitamin A', unit: 'mg', goal: 0.9 },
    { key: 'vitamin_B6_mg', label: 'Vitamin B6', unit: 'mg', goal: 1.3 },
    { key: 'vitamin_B12_mg', label: 'Vitamin B12', unit: 'mg', goal: 0.0024 },
    { key: 'vitamin_C_mg', label: 'Vitamin C', unit: 'mg', goal: 90 },
    { key: 'vitamin_D_mg', label: 'Vitamin D', unit: 'mg', goal: 0.015 },
    { key: 'vitamin_E_mg', label: 'Vitamin E', unit: 'mg', goal: 15 },
    { key: 'fiber_g', label: 'Fiber', unit: 'g', goal: 25 },
    { key: 'calcium_mg', label: 'Calcium', unit: 'mg', goal: 1000 },
    { key: 'magnesium_mg', label: 'Magnesium', unit: 'mg', goal: 400 },
    { key: 'iron_mg', label: 'Iron', unit: 'mg', goal: 8 },
    { key: 'zinc_mg', label: 'Zinc', unit: 'mg', goal: 11 },
    { key: 'potassium_mg', label: 'Potassium', unit: 'mg', goal: 4700 },
];

function MiniNutrientBar({ label, value = 0, goal = 1, unit = 'mg' }) {
    const safeGoal = goal > 0 ? goal : 1;
    const pct = Math.min((value / safeGoal) * 100, 100);

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-white/80">
                <span>{label}</span>
                <span>{value.toFixed(2)} {unit} / {safeGoal} {unit}</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function RecipeModal({ recipe, onClose }) {
    if (!recipe) return null;

    const macros = recipe.macros || recipe.macro || {};
    const micronutrients = recipe.micronutrients || {};
    const ingredients = recipe.ingredients_used || recipe.ingredients || [];
    const instructions = String(recipe.instructions || '');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* затемнение */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* сама карточка; можно скроллить, если не влезает */}
            <div className="relative bg-[#13062b] border border-white/20 shadow-2xl rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2"
                >
                    <X className="w-5 h-5 text-white" />
                </button>

                <h2 className="text-3xl font-bold text-white mb-3">
                    {recipe.name || 'Recipe'}
                </h2>

                <div className="text-sm text-amber-300 font-semibold mb-6">
                    {Math.round(macros.calories || 0)} kcal • {Math.round(macros.protein || 0)}g protein • {Math.round(macros.fat || 0)}g fat • {Math.round(macros.carbs || 0)}g carbs
                </div>

                {/* Ингредиенты */}
                {ingredients.length > 0 && (
                    <section className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Ingredients</h3>
                        <ul className="list-disc list-inside text-sm text-purple-50 space-y-1">
                            {ingredients.map((ing, idx) => (
                                <li key={idx}>
                                    {typeof ing === 'string'
                                        ? ing
                                        : `${ing.name || ''} ${ing.amount || ''}`}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Инструкции */}
                {instructions && (
                    <section className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Instructions</h3>
                        <p className="text-sm text-purple-50 whitespace-pre-line">
                            {instructions}
                        </p>
                    </section>
                )}

                {/* Микронутриенты */}
                <section className="mb-2">
                    <h3 className="text-lg font-semibold text-white mb-3">Micronutrients</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MICRO_CONFIG.map((m) => {
                            const raw = micronutrients[m.key];
                            const value =
                                raw === undefined || raw === null ? 0 : Number(raw);
                            return (
                                <MiniNutrientBar
                                    key={m.key}
                                    label={m.label}
                                    value={value || 0}
                                    goal={m.goal}
                                    unit={m.unit}
                                />
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}

function RecipeCard({ recipe, isChosen, onAdd, onOpen }) {
    const [localChosen, setLocalChosen] = useState(false);
    const macros = recipe.macros || recipe.macro || {};
    const instructions = String(recipe.instructions || '');
    const shortInstr =
        instructions.length > 110
            ? instructions.slice(0, 110) + '…'
            : instructions;

    const chosen = isChosen || localChosen;

    const handleAdd = (e) => {
        e.stopPropagation();
        if (!chosen) {
            setLocalChosen(true);
            onAdd && onAdd(recipe);
        }
    };

    return (
        <div
            className="bg-white/5 border border-white/15 rounded-2xl p-6 backdrop-blur hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => onOpen && onOpen(recipe)}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                    <h3 className="text-white font-semibold text-lg">
                        {recipe.name || 'Untitled recipe'}
                    </h3>
                    {instructions && (
                        <p className="text-sm text-purple-100/80">
                            {shortInstr}
                        </p>
                    )}
                    <div className="text-xs text-amber-300 font-semibold mt-2">
                        {Math.round(macros.calories || 0)} kcal • {Math.round(macros.protein || 0)}g protein • {Math.round(macros.fat || 0)}g fat • {Math.round(macros.carbs || 0)}g carbs
                    </div>
                </div>

                <button
                    onClick={handleAdd}
                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border ${
                        chosen
                            ? 'bg-emerald-400 border-emerald-300'
                            : 'bg-white/10 border-white/40 hover:bg-white/20'
                    } transition-all`}
                >
                    {chosen ? (
                        <Check className="w-5 h-5 text-purple-900" />
                    ) : (
                        <Plus className="w-5 h-5 text-white" />
                    )}
                </button>
            </div>
        </div>
    );
}

export default function RecipesBranch({
                                          recipes = [],
                                          chosenRecipes = [],
                                          onAddRecipe,
                                          onIncrement,
                                      }) {
    const [openedRecipe, setOpenedRecipe] = useState(null);
    const chosenNames = new Set((chosenRecipes || []).map((r) => r.name));

    return (
        <div className="space-y-4">
            <div className="flex items-baseline justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        Suggested recipes: ({recipes.length || 0})
                    </h2>
                    <p className="text-sm text-purple-100/80">
                        Included in plan: {chosenRecipes?.length || 0}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipes.map((r) => (
                    <RecipeCard
                        key={r.name || r.id || Math.random()}
                        recipe={r}
                        isChosen={chosenNames.has(r.name)}
                        onAdd={(rec) => {
                            onAddRecipe && onAddRecipe(rec);
                            onIncrement && onIncrement();
                        }}
                        onOpen={(rec) => setOpenedRecipe(rec)}
                    />
                ))}
            </div>

            <RecipeModal
                recipe={openedRecipe}
                onClose={() => setOpenedRecipe(null)}
            />
        </div>
    );
}
