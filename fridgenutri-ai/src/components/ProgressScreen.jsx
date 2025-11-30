// src/components/ProgressScreen.jsx
'use client';
import { useMemo, useState } from 'react';

// конфиг для микро
const MICRO_CONFIG = [
    { key: 'vitamin_A_mg', label: 'Vitamin A', unit: 'mg', defaultGoal: 0.9, color: 'bg-orange-400' },
    { key: 'vitamin_B6_mg', label: 'Vitamin B6', unit: 'mg', defaultGoal: 1.3, color: 'bg-orange-300' },
    { key: 'vitamin_B12_mg', label: 'Vitamin B12', unit: 'mg', defaultGoal: 0.0024, color: 'bg-orange-200' },
    { key: 'vitamin_C_mg', label: 'Vitamin C', unit: 'mg', defaultGoal: 90, color: 'bg-emerald-400' },
    { key: 'vitamin_D_mg', label: 'Vitamin D', unit: 'mg', defaultGoal: 0.015, color: 'bg-emerald-300' },
    { key: 'vitamin_E_mg', label: 'Vitamin E', unit: 'mg', defaultGoal: 15, color: 'bg-emerald-200' },
    { key: 'fiber_g', label: 'Fiber', unit: 'g', defaultGoal: 25, color: 'bg-lime-400' },
    { key: 'calcium_mg', label: 'Calcium', unit: 'mg', defaultGoal: 1000, color: 'bg-indigo-400' },
    { key: 'magnesium_mg', label: 'Magnesium', unit: 'mg', defaultGoal: 400, color: 'bg-indigo-300' },
    { key: 'iron_mg', label: 'Iron', unit: 'mg', defaultGoal: 8, color: 'bg-rose-400' },
    { key: 'zinc_mg', label: 'Zinc', unit: 'mg', defaultGoal: 11, color: 'bg-sky-400' },
    { key: 'potassium_mg', label: 'Potassium', unit: 'mg', defaultGoal: 4700, color: 'bg-teal-400' },
];

export default function ProgressScreen({ days = [] }) {
    const user = JSON.parse(localStorage.getItem('fridgeNutriUser') || '{}');
    if (!days || days.length === 0) return <div className="text-white">No days available yet.</div>;

    // normalize days and revive dates
    const normalizedDays = useMemo(() => {
        return (days || []).map(d => ({
            ...d,
            date: d.date instanceof Date ? d.date : new Date(d.date),
        }));
    }, [days]);

    const [selectedDayId, setSelectedDayId] = useState(
        normalizedDays[normalizedDays.length - 1].id
    );

    const selectedDay = normalizedDays.find(d => d.id === selectedDayId) || normalizedDays[0];

    // цели по макро
    const macroGoals = {
        calories: user.caloriesGoal || 2500,
        protein: user.nutrients?.protein || 150,
        carbs: user.nutrients?.carbs || 250,
        fats: user.nutrients?.fats || 70,
    };

    // цели по микро
    const microGoals = MICRO_CONFIG.reduce((acc, m) => {
        acc[m.key] = user.nutrients?.[m.key] || m.defaultGoal;
        return acc;
    }, {});

    // тоталы за день (макро + микро)
    const totals = selectedDay?.totals || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        // микро по умолчанию
        vitamin_A_mg: 0,
        vitamin_B6_mg: 0,
        vitamin_B12_mg: 0,
        vitamin_C_mg: 0,
        vitamin_D_mg: 0,
        vitamin_E_mg: 0,
        fiber_g: 0,
        calcium_mg: 0,
        magnesium_mg: 0,
        iron_mg: 0,
        zinc_mg: 0,
        potassium_mg: 0,
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Daily Progress</h1>

            <select
                className="bg-white/10 text-white p-3 rounded-xl border border-white/20"
                value={selectedDayId}
                onChange={(e) => setSelectedDayId(e.target.value)}
            >
                {normalizedDays.map(day => (
                    <option key={day.id} value={day.id} className="text-black">
                        {day.weekday} • {day.date.toLocaleDateString()}
                    </option>
                ))}
            </select>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur space-y-6">
                <h2 className="text-xl text-white font-bold">
                    {selectedDay.weekday} • {selectedDay.date.toLocaleDateString()}
                </h2>

                {/* MACROS */}
                <MetricBar label="Calories" value={totals.calories} goal={macroGoals.calories} color="bg-red-500" />
                <MetricBar label="Protein" value={totals.protein} goal={macroGoals.protein} color="bg-blue-500" />
                <MetricBar label="Carbs" value={totals.carbs} goal={macroGoals.carbs} color="bg-yellow-400" />
                <MetricBar label="Fats" value={totals.fat} goal={macroGoals.fats} color="bg-green-500" />

                {/* MICROS */}
                <div className="pt-4 mt-2 border-t border-white/10 space-y-3">
                    <h3 className="text-lg font-semibold text-white">Micronutrients</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MICRO_CONFIG.map(m => {
                            const value = Number(totals[m.key] || 0);
                            const goal = microGoals[m.key] || 1;
                            // если в дне всё 0, можно не показывать, но можно и оставить — на твой вкус
                            return (
                                <MetricBar
                                    key={m.key}
                                    label={`${m.label} (${m.unit})`}
                                    value={value}
                                    goal={goal}
                                    color={m.color}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricBar({ label, value = 0, goal = 1, color = 'bg-blue-500' }) {
    const pct = Math.min(goal > 0 ? (value / goal) * 100 : 0, 100);
    return (
        <div>
            <div className="flex justify-between text-white text-sm mb-1">
                <div className="font-medium">{label}</div>
                <div className="text-xs text-gray-200">
                    {Math.round(value * 100) / 100} / {goal}
                </div>
            </div>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`${color} h-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

