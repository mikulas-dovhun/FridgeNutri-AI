// src/utils/dietScore.js

// какие микронутриенты учитываем в "покрытии"
export const MICRO_KEYS = [
    'vitamin_A_mg',
    'vitamin_B6_mg',
    'vitamin_B12_mg',
    'vitamin_C_mg',
    'vitamin_D_mg',
    'vitamin_E_mg',
    'fiber_g',
    'calcium_mg',
    'magnesium_mg',
    'iron_mg',
    'zinc_mg',
    'potassium_mg',
    // опционально: 'sugar_g' если позже добавишь
];

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/**
 * Класс, который считает саб-скоры и общий Nutrition Score для дня.
 *
 * totals — объект с суммарными нутриентами за день (как в day.totals)
 * goals  — объект с целями (калории, макро, микро)
 *
 * Результат:
 * {
 *   overall: 0..100,
 *   subscores: { calories, macros, fiber, sugar, micros }
 * }
 */
export class DietScore {
    // 1) Насколько калории близко к цели
    static caloriesScore(totals, goals) {
        const cal = safeNum(totals.calories);
        const goal = safeNum(goals.calories);
        if (!goal || !cal) return null;

        // относительное отклонение от цели: 0 = идеально, 0.5 = на 50% мимо, 1 = в 0 или 2 раза от цели
        const diff = Math.abs(cal - goal) / goal;

        // diff = 0  → 100 баллов
        // diff = 0.5 (в 1.5 раза меньше/больше цели) → 50 баллов
        // diff >= 1 (0 ккал или в 2+ раза больше цели) → 0 баллов
        const score = clamp(100 * (1 - diff), 0, 100);

        return score;
    }

    // 2) Баланс БЖУ (по % калорий)
    // базируемся на AMDR: 45–65% carbs, 10–35% protein, 20–35% fat:contentReference[oaicite:0]{index=0}
    static macrosScore(totals) {
        const p = safeNum(totals.protein);
        const c = safeNum(totals.carbs);
        const f = safeNum(totals.fat);
        const energyFromMacros = p * 4 + c * 4 + f * 9;
        if (!energyFromMacros) return null;

        const pPct = (p * 4 * 100) / energyFromMacros;
        const cPct = (c * 4 * 100) / energyFromMacros;
        const fPct = (f * 9 * 100) / energyFromMacros;

        // таргетные середины диапазонов
        const target = { p: 20, c: 50, f: 30 };
        const dev =
            Math.abs(pPct - target.p) / target.p +
            Math.abs(cPct - target.c) / target.c +
            Math.abs(fPct - target.f) / target.f;

        // dev = 0 → 100 баллов; dev ≥ 3 (~очень кривой баланс) → 0
        const score = clamp(100 * (1 - dev / 3), 0, 100);
        return score;
    }

    // 3) Клетчатка (чем ближе к цели, тем лучше; перебор не штрафуем)
    static fiberScore(totals, goals) {
        const fiber = safeNum(totals.fiber_g);
        const goal = safeNum(goals.fiber_g);
        if (!goal) return null;
        const ratio = fiber / goal;
        return clamp(ratio * 100, 0, 100);
    }

    // 4) Сахар: % калорий из сахара
    // Рекомендуется <10% (лучше <5%) от калорий:contentReference[oaicite:1]{index=1}
    static sugarScore(totals) {
        const sugar = safeNum(totals.sugar_g); // добавишь в backend/recipes если захочешь
        const calories = safeNum(totals.calories);
        if (!sugar || !calories) return null;

        const sugarKcal = sugar * 4;
        const frac = sugarKcal / calories; // 0..1

        if (frac <= 0.05) return 100; // <5% — отлично
        if (frac <= 0.1) {
            // 5–10% → 100..60
            return clamp(100 - ((frac - 0.05) / 0.05) * 40, 0, 100);
        }
        if (frac <= 0.2) {
            // 10–20% → 60..0
            return clamp(60 - ((frac - 0.1) / 0.1) * 60, 0, 100);
        }
        return 0;
    }

    // 5) Покрытие микронутриентов: средний % от дневной нормы
    static microsScore(totals, goals) {
        let sum = 0;
        let count = 0;
        for (const key of MICRO_KEYS) {
            const goal = safeNum(goals[key]);
            if (!goal) continue;
            const have = safeNum(totals[key]);
            const coverage = clamp(have / goal, 0, 1); // 0..1
            sum += coverage;
            count += 1;
        }
        if (!count) return null;
        return (sum / count) * 100;
    }

    static compute(totals = {}, goals = {}) {
        const calories = this.caloriesScore(totals, goals);
        const macros = this.macrosScore(totals);
        const fiber = this.fiberScore(totals, goals);
        const sugar = this.sugarScore(totals);
        const micros = this.microsScore(totals, goals);

        const subscores = { calories, macros, fiber, sugar, micros };

        // Веса — можно потом подкрутить
        const weights = {
            calories: 0.2,
            macros: 0.25,
            fiber: 0.2,
            sugar: 0.15,
            micros: 0.2,
        };

        let wSum = 0;
        let total = 0;
        for (const [k, v] of Object.entries(subscores)) {
            if (v == null) continue;
            const w = weights[k] ?? 0;
            total += v * w;
            wSum += w;
        }

        const overall = wSum ? total / wSum : 0;

        return {
            overall: clamp(overall, 0, 100),
            subscores,
        };
    }
}
