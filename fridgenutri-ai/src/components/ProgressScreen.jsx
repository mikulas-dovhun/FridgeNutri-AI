'use client';

import { useMemo, useState } from 'react';
import { DietScore, MICRO_KEYS } from './Chatbot/dietScore';

const MICRO_CONFIG = [
    { key: 'vitamin_A_mg', label: 'Vitamin A', unit: 'mg', defaultGoal: 0.9 },
    { key: 'vitamin_B6_mg', label: 'Vitamin B6', unit: 'mg', defaultGoal: 1.3 },
    { key: 'vitamin_B12_mg', label: 'Vitamin B12', unit: 'mg', defaultGoal: 0.0024 },
    { key: 'vitamin_C_mg', label: 'Vitamin C', unit: 'mg', defaultGoal: 90 },
    { key: 'vitamin_D_mg', label: 'Vitamin D', unit: 'mg', defaultGoal: 0.015 },
    { key: 'vitamin_E_mg', label: 'Vitamin E', unit: 'mg', defaultGoal: 15 },
    { key: 'fiber_g', label: 'Fiber', unit: 'g', defaultGoal: 25 },
    { key: 'calcium_mg', label: 'Calcium', unit: 'mg', defaultGoal: 1000 },
    { key: 'magnesium_mg', label: 'Magnesium', unit: 'mg', defaultGoal: 400 },
    { key: 'iron_mg', label: 'Iron', unit: 'mg', defaultGoal: 8 },
    { key: 'zinc_mg', label: 'Zinc', unit: 'mg', defaultGoal: 11 },
    { key: 'potassium_mg', label: 'Potassium', unit: 'mg', defaultGoal: 4700 },
];

export default function ProgressScreen({ days = [] }) {
    const user = JSON.parse(localStorage.getItem('fridgeNutriUser') || '{}');
    if (!days || days.length === 0) {
        return <div className="text-white">No days available yet.</div>;
    }

    const normalizedDays = useMemo(
        () =>
            (days || []).map((d) => ({
                ...d,
                date: d.date instanceof Date ? d.date : new Date(d.date),
            })),
        [days],
    );

    const [selectedDayId, setSelectedDayId] = useState(
        normalizedDays[normalizedDays.length - 1]?.id,
    );
    const [showScoreModal, setShowScoreModal] = useState(false);

    const selectedDay =
        normalizedDays.find((d) => d.id === selectedDayId) || normalizedDays[0];

    // goals
    const macroGoals = {
        calories: user.caloriesGoal || 2500,
        protein: user.nutrients?.protein || 150,
        carbs: user.nutrients?.carbs || 250,
        fats: user.nutrients?.fats || 70,
    };

    const microGoals = MICRO_CONFIG.reduce((acc, m) => {
        acc[m.key] = user.nutrients?.[m.key] || m.defaultGoal;
        return acc;
    }, {});

    const allGoals = { ...macroGoals, ...microGoals };

    // totals выбранного дня
    const totals = {
        calories: selectedDay?.totals?.calories || 0,
        protein: selectedDay?.totals?.protein || 0,
        carbs: selectedDay?.totals?.carbs || 0,
        fat: selectedDay?.totals?.fat || 0,
        ...MICRO_KEYS.reduce((acc, key) => {
            acc[key] = selectedDay?.totals?.[key] || 0;
            return acc;
        }, {}),
        sugar_g: selectedDay?.totals?.sugar_g || 0,
    };

    // считаем score для всех дней + history
    const { scoresById, history } = useMemo(() => {
        const scores = {};
        normalizedDays.forEach((day) => {
            const t = {
                calories: day.totals?.calories || 0,
                protein: day.totals?.protein || 0,
                carbs: day.totals?.carbs || 0,
                fat: day.totals?.fat || 0,
                ...MICRO_KEYS.reduce((acc, key) => {
                    acc[key] = day.totals?.[key] || 0;
                    return acc;
                }, {}),
                sugar_g: day.totals?.sugar_g || 0,
            };
            scores[day.id] = DietScore.compute(t, allGoals);
        });

        const last14 = normalizedDays.slice(-14).map((d) => ({
            id: d.id,
            label: d.date.toLocaleDateString(),
            weekday: d.weekday,
            score: scores[d.id]?.overall ?? 0,
        }));

        return { scoresById: scores, history: last14 };
    }, [normalizedDays, allGoals]);

    const selectedScore =
        scoresById[selectedDay.id] || DietScore.compute(totals, allGoals);
    const overallScore = Math.round(selectedScore.overall || 0);

    const scoreBadgeColor =
        overallScore >= 80 ? 'bg-emerald-400' : overallScore >= 60 ? 'bg-yellow-400' : 'bg-rose-400';

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Daily Progress</h1>

            {/* карточка со score */}
            <button
                onClick={() => setShowScoreModal(true)}
                className="w-full bg-white/5 border border-white/15 rounded-2xl p-5 flex items-center justify-between gap-4 hover:bg-white/10 transition"
            >
                <div className="text-left">
                    <div className="text-sm text-white/70">Nutrition score</div>
                    <div className="text-xs text-white/50">
                        Click to see detailed breakdown & last 14 days
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right text-xs text-white/60">
                        <div>
                            Calories:{' '}
                            {selectedScore.subscores.calories != null
                                ? Math.round(selectedScore.subscores.calories)
                                : '-'}
                        </div>
                        <div>
                            Macros:{' '}
                            {selectedScore.subscores.macros != null
                                ? Math.round(selectedScore.subscores.macros)
                                : '-'}
                        </div>
                        <div>
                            Micros:{' '}
                            {selectedScore.subscores.micros != null
                                ? Math.round(selectedScore.subscores.micros)
                                : '-'}
                        </div>
                    </div>
                    <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-purple-950 ${scoreBadgeColor}`}
                    >
                        {overallScore}
                    </div>
                </div>
            </button>

            {/* выбор дня */}
            <select
                className="bg-white/10 text-white p-3 rounded-xl border border-white/20"
                value={selectedDayId}
                onChange={(e) => setSelectedDayId(e.target.value)}
            >
                {normalizedDays.map((day) => (
                    <option key={day.id} value={day.id} className="text-black">
                        {day.weekday} • {day.date.toLocaleDateString()}
                    </option>
                ))}
            </select>

            {/* основной блок с макро/микро */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur space-y-6">
                <h2 className="text-xl text-white font-bold">
                    {selectedDay.weekday} • {selectedDay.date.toLocaleDateString()}
                </h2>

                {/* Macros */}
                <MetricBar label="Calories" value={totals.calories} goal={macroGoals.calories} color="bg-red-500" />
                <MetricBar label="Protein" value={totals.protein} goal={macroGoals.protein} color="bg-blue-500" />
                <MetricBar label="Carbs" value={totals.carbs} goal={macroGoals.carbs} color="bg-yellow-400" />
                <MetricBar label="Fats" value={totals.fat} goal={macroGoals.fats} color="bg-green-500" />

                {/* Micros */}
                <div className="pt-4 mt-2 border-t border-white/10 space-y-3">
                    <h3 className="text-lg font-semibold text-white">Micronutrients</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MICRO_CONFIG.map((m) => {
                            const value = Number(totals[m.key] || 0);
                            const goal = microGoals[m.key] || m.defaultGoal || 1;
                            return (
                                <MetricBar
                                    key={m.key}
                                    label={`${m.label} (${m.unit})`}
                                    value={value}
                                    goal={goal}
                                    color="bg-cyan-400"
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            <ScoreModal
                open={showScoreModal}
                onClose={() => setShowScoreModal(false)}
                score={selectedScore}
                history={history}
            />
        </div>
    );
}

function MetricBar({ label, value = 0, goal = 1, color = 'bg-blue-500' }) {
    const pct = Math.min(goal > 0 ? (value / goal) * 100 : 0, 120);
    return (
        <div>
            <div className="flex justify-between text-white text-sm mb-1">
                <div className="font-medium">{label}</div>
                <div className="text-xs text-gray-200">
                    {Math.round(value * 100) / 100} / {goal}
                </div>
            </div>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                <div className={`${color} h-full transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

/* ==================== MODAL ==================== */

function ScoreModal({ open, onClose, score, history }) {
    if (!open || !score) return null;

    const subs = score.subscores || {};
    const rows = [
        { key: 'calories', label: 'Calories balance' },
        { key: 'macros', label: 'Macro balance' },
        { key: 'fiber', label: 'Fiber intake' },
        { key: 'sugar', label: 'Sugar intake' },
        { key: 'micros', label: 'Micronutrient coverage' },
    ];

    const badgeColor =
        score.overall >= 80 ? 'bg-emerald-400' : score.overall >= 60 ? 'bg-yellow-400' : 'bg-rose-400';

    // история 0..100
    const cleanHistory = (history || []).map((d) => ({
        ...d,
        score: Math.max(0, Math.min(100, Number(d.score || 0))),
    }));
    const hasData = cleanHistory.length > 0;

    // средний за 7 дней
    const nonZero = cleanHistory.filter((d) => d.score > 0);
    const last7 = nonZero.slice(-7);
    const avgLast7 =
        last7.length > 0 ? last7.reduce((sum, d) => sum + d.score, 0) / last7.length : 0;

    const yForScore = (s) => {
        const clamped = Math.max(0, Math.min(100, s));
        return 90 - (clamped / 100) * 70; // паддинги сверху/снизу
    };

    const maxIndex = Math.max(cleanHistory.length - 1, 1);
    const polylinePoints = cleanHistory
        .map((d, idx) => {
            const x = 8 + (idx / maxIndex) * 84; // отступ слева/справа, чтобы не пересекать подписи
            const y = yForScore(d.score);
            return `${x},${y}`;
        })
        .join(' ');

    const barColor = (v) => {
        if (v >= 80) return 'bg-emerald-400';
        if (v >= 60) return 'bg-yellow-400';
        return 'bg-rose-400';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6 md:p-8 space-y-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 text-xs md:text-sm text-white"
                >
                    ✕
                </button>

                {/* заголовок */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-white">Daily nutrition score</h2>
                        <p className="text-xs md:text-sm text-white/70 max-w-xl">
                            Overall quality of your day based on calories, macro balance, fiber, sugar and
                            micronutrient coverage.
                        </p>
                    </div>
                    <div
                        className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold text-purple-950 ${badgeColor}`}
                    >
                        {Math.round(score.overall)}
                    </div>
                </div>

                {/* две колонки */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Sub-scores */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Sub-scores</h3>
                        <div className="space-y-3">
                            {rows.map(({ key, label }) => {
                                const v = subs[key];
                                if (v == null) return null;
                                const pct = Math.max(0, Math.min(100, v));
                                return (
                                    <div key={key}>
                                        <div className="flex justify-between text-[11px] md:text-xs text-white/70 mb-1">
                                            <span>{label}</span>
                                            <span>{Math.round(pct)}</span>
                                        </div>
                                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`${barColor(pct)} h-full transition-all`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Average last 7 days */}
                        <div className="mt-4 space-y-1">
                            <div className="flex justify-between text-[11px] md:text-xs text-white/70">
                                <span>Average over last 7 days</span>
                                <span>{Math.round(avgLast7)}</span>
                            </div>
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                                    style={{ width: `${Math.max(0, Math.min(100, avgLast7))}%` }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* График */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Score over last 14 days</h3>

                        {hasData ? (
                            <div className="w-full h-32 md:h-36 rounded-2xl bg-white/5 px-3 py-2 flex flex-col">
                                <div className="flex-1 relative">
                                    <svg
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="none"
                                        className="w-full h-full"
                                    >
                                        <defs>
                                            <linearGradient id="scoreLine" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#22d3ee" />
                                                <stop offset="100%" stopColor="#22c55e" />
                                            </linearGradient>
                                        </defs>

                                        {/* сетка + подписи 25/50/75 */}
                                        {[25, 50, 75].map((val) => {
                                            const y = yForScore(val);
                                            return (
                                                <g key={val}>
                                                    <line
                                                        x1="8"
                                                        x2="98"
                                                        y1={y}
                                                        y2={y}
                                                        stroke="rgba(148,163,184,0.18)"
                                                        strokeWidth="0.3"
                                                    />
                                                    <text
                                                        x="2"
                                                        y={y + 1.8}
                                                        fontSize="4"
                                                        fill="rgba(148,163,184,0.8)"
                                                    >
                                                        {val}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* линия */}
                                        <polyline
                                            fill="none"
                                            stroke="url(#scoreLine)"
                                            strokeWidth="1.4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={polylinePoints}
                                        />

                                        {/* точки */}
                                        {cleanHistory.map((d, idx) => {
                                            const x = 8 + (idx / maxIndex) * 84;
                                            const y = yForScore(d.score);
                                            return (
                                                <circle
                                                    key={d.id}
                                                    cx={x}
                                                    cy={y}
                                                    r="0.9"
                                                    fill="#ecfeff"
                                                    stroke="#06b6d4"
                                                    strokeWidth="0.4"
                                                />
                                            );
                                        })}
                                    </svg>
                                </div>

                                {/* дни недели под графиком */}
                                <div className="mt-1 flex justify-between text-[9px] md:text-[10px] text-white/60">
                                    {cleanHistory.map((d) => (
                                        <span key={d.id}>{d.weekday.slice(0, 3)}</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-white/60">
                                Not enough data yet. Plan meals for several days to see your trend.
                            </p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
