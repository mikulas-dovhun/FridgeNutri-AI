// src/components/Chatbot/AnalyzedView.jsx
import FridgePhoto from './FridgePhoto';
import IngredientsGrid from './IngredientsGrid';
import RecipesBranch from './RecipesBranch';

// ----- helpers для работы с "складом" ингредиентов -----

// парсим строку количества из Available ingredients: "6", "200g", "2 bottles"
function parseAmountString(amountStr) {
    if (!amountStr) return { qty: Infinity, unit: '' };

    const str = String(amountStr);
    const m = str.match(/([\d.,]+)/);
    if (!m) return { qty: Infinity, unit: str.trim() };

    const num = parseFloat(m[1].replace(',', '.'));
    const unit = str.replace(m[1], '').trim();
    return {
        qty: Number.isFinite(num) ? num : Infinity,
        unit,
    };
}

// парсим строку из recipes.ingredients_used: "lemons 2", "orange juice 1 bottle"
function parseRecipeIngredient(str) {
    if (!str) return null;
    const s = String(str).toLowerCase().trim();
    if (!s) return null;

    const m = s.match(/([\d.,]+)/);
    let qty = 1;
    let name = s;

    if (m) {
        qty = parseFloat(m[1].replace(',', '.'));
        name = s.slice(0, m.index).trim() || s;
    }

    return {
        name,
        qty: Number.isFinite(qty) ? qty : 1,
    };
}

// создаём "склад": { 'lemons': { qty, unit, original } }
function buildStock(ingredients = []) {
    const stock = {};
    for (const ing of ingredients) {
        if (! ing?.name) continue;
        const key = ing.name.toLowerCase().trim();
        const { qty, unit } = parseAmountString(ing.amount);
        stock[key] = {
            qty,
            unit,
            original: ing,
        };
    }
    return stock;
}

// ищем ключ в складе по имени из рецепта
function findMatchingKey(stock, name) {
    if (!name) return null;
    const n = name.toLowerCase().trim();
    if (stock[n]) return n;

    const keys = Object.keys(stock);
    // простое "фаззи" совпадение
    return (
        keys.find(k => k.includes(n)) ||
        keys.find(k => n.includes(k)) ||
        null
    );
}

// применяем уже выбранные рецепты: уменьшаем количества на складе
function applyRecipeUsage(stock, chosenRecipes = []) {
    for (const recipe of chosenRecipes || []) {
        for (const raw of recipe.ingredients_used || []) {
            const parsed = parseRecipeIngredient(raw);
            if (!parsed) continue;

            const key = findMatchingKey(stock, parsed.name);
            if (!key) continue;

            const item = stock[key];
            if (!item || !Number.isFinite(item.qty)) continue;

            item.qty = Math.max(item.qty - parsed.qty, 0);
        }
    }
}

// превращаем склад обратно в массив для грида
function stockToIngredients(stock) {
    const result = [];

    for (const [key, data] of Object.entries(stock)) {
        const { qty, unit, original } = data;

        // если количество закончилось — вообще не показываем
        if (Number.isFinite(qty) && qty <= 0) continue;

        let amountText = original?.amount;
        if (Number.isFinite(qty)) {
            // собираем строку из остатка + единицы измерения
            const suffix = unit || '';
            amountText = suffix ? `${qty} ${suffix}` : String(qty);
        }

        result.push({
            ...original,
            name: original?.name || key,
            amount: amountText,
        });
    }

    return result;
}

// проверяем, можно ли приготовить рецепт из текущего остатка
function canCookRecipe(recipe, stock, chosenNames) {
    // уже выбранные рецепты всегда остаются видимыми
    if (chosenNames.has(recipe.name)) return true;

    const used = recipe.ingredients_used || [];
    if (used.length === 0) return true;

    for (const raw of used) {
        const parsed = parseRecipeIngredient(raw);
        if (!parsed) continue;

        const key = findMatchingKey(stock, parsed.name);
        if (!key) return false;

        const item = stock[key];
        const availableQty = item?.qty;

        if (Number.isFinite(availableQty) && parsed.qty > availableQty + 1e-9) {
            return false; // не хватает этого ингредиента
        }
    }

    return true;
}

// общий расчёт остатков и доступных рецептов
function computeState(ingredients, recipes, chosenRecipes) {
    const baseStock = buildStock(ingredients);

    // клон склада, который будем "тратить"
    const stockAfterChosen = JSON.parse(JSON.stringify(baseStock));

    applyRecipeUsage(stockAfterChosen, chosenRecipes);

    const remainingIngredients = stockToIngredients(stockAfterChosen);
    const chosenNames = new Set((chosenRecipes || []).map(r => r.name));
    const availableRecipes = (recipes || []).filter(r =>
        canCookRecipe(r, stockAfterChosen, chosenNames)
    );

    return { remainingIngredients, availableRecipes };
}

// ----- сам компонент -----

export default function AnalyzedView({
                                         photoUrl,
                                         ingredients,
                                         recipes,
                                         chosenRecipes,
                                         onAddRecipe,
                                         increment,
                                     }) {
    const { remainingIngredients, availableRecipes } = computeState(
        ingredients,
        recipes,
        chosenRecipes
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-8">
                    <FridgePhoto url={photoUrl} />
                    {/* показываем уже ОСТАТКИ ингредиентов */}
                    <IngredientsGrid ingredients={remainingIngredients} />
                </div>
                <div className="lg:col-span-7">
                    {/* показываем только те рецепты, на которые хватает ингредиентов */}
                    <RecipesBranch
                        recipes={availableRecipes}
                        chosenRecipes={chosenRecipes}
                        onAddRecipe={onAddRecipe}
                        onIncrement={increment}
                    />
                </div>
            </div>
        </div>
    );
}
