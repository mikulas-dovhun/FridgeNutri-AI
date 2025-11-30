// src/components/Chatbot/Chatbot.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { generateInitialDays } from '@/utils/dayUtils';
import DayNavigation from './DayNavigation';
import UploadForm from './UploadForm';
import AnalyzedView from './AnalyzedView';
import { useSwipe } from './hooks/useSwipe';
import { RotateCcw } from 'lucide-react';

const STORAGE_KEY_DAYS = 'chatbot_days';
const STORAGE_KEY_IDX = 'chatbot_current_day_index';

const MICRO_KEYS = [
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
];

const EMPTY_TOTALS = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,

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

export default function Chatbot() {
    // ------------- load initial data and revive dates + totals --------------
    const loadInitialData = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_DAYS);
            const savedIndex = localStorage.getItem(STORAGE_KEY_IDX);
            if (saved) {
                const parsed = JSON.parse(saved);
                const revived = parsed.map(d => ({
                    ...d,
                    date: d.date ? new Date(d.date) : new Date(),
                    totals: d.totals || { ...EMPTY_TOTALS },
                    chosenRecipes: d.chosenRecipes || [],
                }));
                return { days: revived, index: savedIndex ? parseInt(savedIndex, 10) : 0 };
            }
        } catch (e) {
            console.warn('Failed to load saved days:', e);
        }

        const fresh = generateInitialDays().map(d => ({
            ...d,
            totals: { ...EMPTY_TOTALS },
            chosenRecipes: [],
        }));

        return { days: fresh, index: 0 };
    };

    const { days: initialDays, index: initialIndex } = loadInitialData();

    const [days, setDays] = useState(initialDays);
    const [currentDayIndex, setCurrentDayIndex] = useState(initialIndex);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const currentDay = days[currentDayIndex];
    const analysis = currentDay?.analysis;
    const headerRef = useRef(null);

    // ------------- persist days to localStorage -------------
    useEffect(() => {
        try {
            const toSave = days.map(d => ({
                ...d,
                date: d.date instanceof Date ? d.date.toISOString() : d.date,
            }));
            localStorage.setItem(STORAGE_KEY_DAYS, JSON.stringify(toSave));
            localStorage.setItem(STORAGE_KEY_IDX, currentDayIndex.toString());
        } catch (e) {
            console.error('Failed to save days', e);
        }
    }, [days, currentDayIndex]);

    // ------------- swipe card navigation -------------
    useSwipe(headerRef, {
        onSwipeLeft: () => setCurrentDayIndex(i => Math.min(i + 1, days.length - 1)),
        onSwipeRight: () => setCurrentDayIndex(i => Math.max(i - 1, 0)),
        threshold: 70,
    });

    const addDay = () => {
        setDays(prev => {
            const last = prev[prev.length - 1];
            const next = new Date(last.date);
            next.setDate(next.getDate() + 1);
            const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            const newDay = {
                id: next.toISOString().slice(0, 10),
                date: next,
                dayNumber: next.getDate(),
                weekday: WEEK[next.getDay()],
                photoUrl: null,
                analysis: null,
                chosenRecipes: [],
                totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            };

            return [...prev, newDay];
        });

        setCurrentDayIndex(days.length);
    };

    // ------------- analyze (upload) -------------
    const analyzeFridge = async (file, previewUrl) => {
        setIsAnalyzing(true);
        const fd = new FormData();
        fd.append('file', file);

        try {
            const res = await fetch('http://localhost:8000/analyze', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setDays(prev => {
                const copy = [...prev];
                const day = copy[currentDayIndex];
                copy[currentDayIndex] = {
                    ...day,
                    photoUrl: previewUrl,
                    analysis: data,
                    chosenRecipes: day.chosenRecipes || [],
                    totals: day.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 },
                };
                return copy;
            });
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const deleteDay = (index) => {
        if (!confirm("Delete this day?")) return;

        setDays(prev => {
            if (prev.length === 1) {
                alert("You cannot delete the last remaining day.");
                return prev;
            }

            const updated = prev.filter((_, i) => i !== index);

            // fix current index if necessary
            if (currentDayIndex >= updated.length) {
                setCurrentDayIndex(updated.length - 1);
            } else if (index < currentDayIndex) {
                setCurrentDayIndex(i => i - 1);
            }

            return updated;
        });
    };

    // ------------- reset current day -------------
    const resetDay = () => {
        if (!confirm("Clear today's fridge analysis and totals?")) return;
        setDays(prev => {
            const copy = [...prev];
            copy[currentDayIndex] = {
                ...copy[currentDayIndex],
                photoUrl: null,
                analysis: null,
                chosenRecipes: [],
                totals: { ...EMPTY_TOTALS },
            };
            return copy;
        });
    };

    // ------------- add recipe (compute totals) -------------
    // recipe object should contain recipe.macros = { calories, protein, carbs, fat }
    const addRecipe = (recipe) => {
        setDays(prev => {
            const copy = [...prev];
            const day = copy[currentDayIndex];

            // avoid duplicates (by name)
            if (!day.chosenRecipes.some(r => r.name === recipe.name)) {
                day.chosenRecipes = [...(day.chosenRecipes || []), recipe];
            }

            // пересчитываем totals с учётом МАКРО + МИКРО
            const totals = (day.chosenRecipes || []).reduce((acc, r) => {
                const m = r.macros || r.macro || {};
                const micro = r.micronutrients || {};

                // макро
                acc.calories += Number(m.calories || 0);
                acc.protein  += Number(m.protein  || 0);
                acc.carbs    += Number(m.carbs    || 0);
                acc.fat      += Number(m.fat      || 0);

                // микро
                MICRO_KEYS.forEach((key) => {
                    acc[key] += Number(micro[key] || 0);
                });

                return acc;
            }, { ...EMPTY_TOTALS });

            day.totals = totals;
            return copy;
        });
    };


    const removeRecipe = (name) => {
        setDays(prev => {
            const copy = [...prev];
            const day = copy[currentDayIndex];
            day.chosenRecipes = (day.chosenRecipes || []).filter(r => r.name !== name);

            // recompute totals
            const totals = (day.chosenRecipes || []).reduce((acc, r) => {
                const m = r.macros || r.macro || {};
                const micro = r.micronutrients || {};

                acc.calories += Number(m.calories || 0);
                acc.protein  += Number(m.protein  || 0);
                acc.carbs    += Number(m.carbs    || 0);
                acc.fat      += Number(m.fat      || 0);

                MICRO_KEYS.forEach((key) => {
                    acc[key] += Number(micro[key] || 0);
                });

                return acc;
            }, { ...EMPTY_TOTALS });

            day.totals = totals;
            return copy;
        });
    };

    // optional: increment global meal counter in localStorage
    const incrementMealCounter = () => {
        const prev = Number(localStorage.getItem('countItems')) || 0;
        const next = prev + 1;
        localStorage.setItem('countItems', next.toString());
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 text-white">
            <header
                ref={headerRef}
                className="flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-lg"
            >
                <DayNavigation
                    days={days}
                    currentDayIndex={currentDayIndex}
                    onSwitchDay={setCurrentDayIndex}
                    onAddDay={addDay}
                    onDeleteDay={deleteDay}
                />

                <div className="flex items-center gap-3">
                    <button
                        onClick={resetDay}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-xl transition"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Reset
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto w-full">
                    {!analysis ? (
                        <UploadForm onAnalyze={analyzeFridge} isLoading={isAnalyzing} />
                    ) : (
                        <AnalyzedView
                            photoUrl={currentDay.photoUrl}
                            ingredients={analysis.ingredients || []}
                            recipes={analysis.recipes || []}
                            chosenRecipes={currentDay.chosenRecipes || []}
                            onAddRecipe={(recipe) => {
                                addRecipe(recipe);
                                incrementMealCounter();
                            }}
                            onRemoveRecipe={removeRecipe}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
