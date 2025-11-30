import { DAILY_NUTRIENTS, NUTRIENT_SOURCES } from './constants';

export const getBaseIngName = (raw: string | null) => {
    if (!raw) return '';
    const lower = String(raw).toLowerCase();
    const parts = lower.split(/[0-9]/);
    return parts[0].replace(/[()]/g, '').trim();
};

export const computeTotals = (recipes: Recipe[]) => {
    // ... your code
};

export const getRecipeNutrients = (recipe: Recipe) => {
    // ... your code
};

// Add a function for microProgress calculation
export const calculateMicroProgress = (totals: { macros: Macros; micros: Micros }) => {
    return Object.entries(DAILY_NUTRIENTS).map(([key, target]) => {
        // ... your code
    });
};

// Types (or move to types/chatbotTypes.ts)
export type Recipe = { /* define shape */ };
export type Macros = { calories: number; protein: number; carbs: number; fat: number };
export type Micros = { [key: string]: number };