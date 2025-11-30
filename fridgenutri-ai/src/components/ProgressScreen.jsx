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

        const gaugeColor =
            overallScore >= 80 ? '#22c55e' : overallScore >= 60 ? '#facc15' : '#fb7185';

        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-white">Daily Progress</h1>

                <button
                    onClick={() => setShowScoreModal(true)}
                    className="w-full rounded-3xl border border-white/15 bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-purple-900/80 px-6 py-4 flex items-center justify-between gap-6 shadow-lg shadow-purple-900/40 hover:shadow-purple-700/60 hover:border-white/30 transition-all"
                >
                    <div className="text-left space-y-1">
                        <div className="text-sm font-semibold text-white/80 tracking-wide">
                            Nutrition score
                        </div>
                        <div className="text-xs text-white/55">
                            Tap to see detailed breakdown and trend for the last 14 days.
                        </div>
                        <div className="flex flex-wrap gap-3 pt-2 text-[11px] text-white/65">
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  Calories:{' '}
                    {selectedScore.subscores.calories != null
                        ? Math.round(selectedScore.subscores.calories)
                        : '-'}
                </span>
                            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  Macros:{' '}
                                {selectedScore.subscores.macros != null
                                    ? Math.round(selectedScore.subscores.macros)
                                    : '-'}
                </span>
                            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  Micros:{' '}
                                {selectedScore.subscores.micros != null
                                    ? Math.round(selectedScore.subscores.micros)
                                    : '-'}
                </span>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center">
                        <div className="relative w-20 h-20 md:w-24 md:h-24">
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: `conic-gradient(${gaugeColor} ${overallScore}%, rgba(148,163,184,0.25) ${overallScore}%)`,
                                    boxShadow: '0 0 40px rgba(0,0,0,0.7)',
                                }}
                            />
                            <div className="absolute inset-2 rounded-full bg-slate-950/90 flex items-center justify-center text-3xl md:text-4xl font-bold text-pink-100">
                                {overallScore}
                            </div>
                        </div>
                    </div>
                </button>

                <select
                    className="bg-white/10 text-white p-3 rounded-xl border border-white/20 shadow-inner shadow-purple-900/30 focus:outline-none focus:ring-2 focus:ring-purple-400/70"
                    value={selectedDayId}
                    onChange={(e) => setSelectedDayId(e.target.value)}
                >
                    {normalizedDays.map((day) => (
                        <option key={day.id} value={day.id} className="text-black">
                            {day.weekday} • {day.date.toLocaleDateString()}
                        </option>
                    ))}
                </select>

                {/* блок с макро/микро — в стиле других страниц */}
                <div className="bg-gradient-to-br from-purple-900/80 via-indigo-900/80 to-slate-950/90 p-6 rounded-3xl border border-white/10 backdrop-blur-lg space-y-6 shadow-[0_18px_40px_rgba(15,23,42,0.9)]">
                    <h2 className="text-xl text-white font-bold">
                        {selectedDay.weekday} • {selectedDay.date.toLocaleDateString()}
                    </h2>

                    {/* Макро */}
                    <MetricBar
                        label="Calories"
                        value={totals.calories}
                        goal={macroGoals.calories}
                        gradient="from-red-500 to-fuchsia-500"
                    />
                    <MetricBar
                        label="Protein"
                        value={totals.protein}
                        goal={macroGoals.protein}
                        gradient="from-sky-500 to-indigo-400"
                    />
                    <MetricBar
                        label="Carbs"
                        value={totals.carbs}
                        goal={macroGoals.carbs}
                        gradient="from-amber-400 to-yellow-300"
                    />
                    <MetricBar
                        label="Fats"
                        value={totals.fat}
                        goal={macroGoals.fats}
                        gradient="from-emerald-500 to-lime-400"
                    />

                    {/* Микро */}
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
                                        gradient="from-cyan-400 to-emerald-400"
                                        compact
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

    function MetricBar({
                           label,
                           value = 0,
                           goal = 1,
                           gradient = 'from-blue-500 to-cyan-400',
                           compact = false,
                       }) {
        const pct = Math.min(goal > 0 ? (value / goal) * 100 : 0, 120);

        return (
            <div className="space-y-1.5">
                <div className="flex justify-between text-white text-xs md:text-sm">
                    <div className="font-medium tracking-wide">{label}</div>
                    <div className="text-[11px] md:text-xs text-gray-200">
                        {Math.round(value * 100) / 100} / {goal}
                    </div>
                </div>
                <div className="w-full h-3.5 bg-slate-950/70 rounded-full overflow-hidden shadow-inner shadow-black/60">
                    <div
                        className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>
        );
    }

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

        const cleanHistory = (history || []).map((d) => ({
            ...d,
            score: Math.max(0, Math.min(100, Number(d.score || 0))),
        }));
        const hasData = cleanHistory.length > 0;

        const nonZero = cleanHistory.filter((d) => d.score > 0);
        const last7 = nonZero.slice(-7);
        const avgLast7 =
            last7.length > 0 ? last7.reduce((sum, d) => sum + d.score, 0) / last7.length : 0;

        const yForScore = (s) => {
            const clamped = Math.max(0, Math.min(100, s));
            return 90 - (clamped / 100) * 70;
        };

        const maxIndex = Math.max(cleanHistory.length - 1, 1);
        const polylinePoints = cleanHistory
            .map((d, idx) => {
                const x = 8 + (idx / maxIndex) * 84; // отступы слева/справа
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

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-bold text-white">Daily nutrition score</h2>
                            <p className="text-xs md:text-sm text-white/70 max-w-xl">
                                Overall quality of your day based on calories, macro balance, fiber, sugar and
                                micronutrient coverage.
                            </p>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <div className="relative w-20 h-20 md:w-24 md:h-24">
                                <div
                                    className={`absolute inset-0 rounded-full ${badgeColor}`}
                                    style={{ boxShadow: '0 0 40px rgba(0,0,0,0.7)' }}
                                />
                                <div className="absolute inset-2 rounded-full bg-slate-950/95 flex items-center justify-center text-3xl md:text-4xl font-bold text-pink-100">
                                    {Math.round(score.overall)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
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

                        <section className="space-y-3">
                            <h3 className="text-lg font-semibold text-white">Score over last 14 days</h3>

                            {hasData ? (
                                <div className="space-y-2">
                                    <div className="relative w-full h-44 md:h-52 rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-950/90 to-slate-950/95">
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

                                            {[25, 50, 75].map((val) => {
                                                const y = yForScore(val);
                                                return (
                                                    <g key={val}>
                                                        <line
                                                            x1="8"
                                                            x2="98"
                                                            y1={y}
                                                            y2={y}
                                                            stroke="rgba(148,163,184,0.22)"
                                                            strokeWidth="0.3"
                                                        />
                                                        <text
                                                            x="2"
                                                            y={y + 1.8}
                                                            fontSize="4"
                                                            fill="rgba(148,163,184,0.85)"
                                                        >
                                                            {val}
                                                        </text>
                                                    </g>
                                                );
                                            })}

                                            <polyline
                                                fill="none"
                                                stroke="url(#scoreLine)"
                                                strokeWidth="1.4"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                points={polylinePoints}
                                            />

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

                                    <div className="flex justify-between text-[9px] md:text-[10px] text-white/60">
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
