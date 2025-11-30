'use client';

import { useState, useMemo } from 'react';

export default function ProgressScreen({ days }) {
    const user = JSON.parse(localStorage.getItem('fridgeNutriUser'));

    if (!user) return <div className="text-white">No user goals found.</div>;
    if (!days || days.length === 0) return <div className="text-white">No days available yet.</div>;

    // Convert date strings → Date objects
    const normalizedDays = useMemo(() => {
        return days.map(d => ({
            ...d,
            date: d.date instanceof Date ? d.date : new Date(d.date)
        }));
    }, [days]);

    // default selected day = most recent
    const [selectedDayId, setSelectedDayId] = useState(
        normalizedDays[normalizedDays.length - 1].id
    );

    const selectedDay = normalizedDays.find(d => d.id === selectedDayId);

    const goals = {
        calories: user.caloriesGoal || 2500,
        protein: user.nutrients?.protein || 150,
        carbs: user.nutrients?.carbs || 250,
        fats: user.nutrients?.fats || 70,
    };

    const totals = selectedDay?.totals || {
        calories: 0, protein: 0, fat: 0, carbs: 0
    };

    return (
        <div className="space-y-10">
            <h1 className="text-3xl font-bold text-white">Daily Progress</h1>

            {/* Select Day Dropdown */}
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

            {/* Progress Bars */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur space-y-6">
                <h2 className="text-xl text-white font-bold">
                    {selectedDay.weekday} • {selectedDay.date.toLocaleDateString()}
                </h2>

                <MetricBar label="Calories" value={totals.calories} goal={goals.calories} color="bg-red-500" />
                <MetricBar label="Protein" value={totals.protein} goal={goals.protein} color="bg-blue-500" />
                <MetricBar label="Carbs" value={totals.carbs} goal={goals.carbs} color="bg-yellow-400" />
                <MetricBar label="Fats" value={totals.fat} goal={goals.fats} color="bg-green-500" />
            </div>
        </div>
    );
}

function MetricBar({ label, value, goal, color }) {
    const pct = Math.min((value / goal) * 100, 100);

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-white text-sm">
                <span>{label}</span>
                <span>{value} / {goal}</span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`${color} h-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
