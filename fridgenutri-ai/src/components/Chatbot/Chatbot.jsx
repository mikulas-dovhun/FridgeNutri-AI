// src/components/Chatbot/Chatbot.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { generateInitialDays } from '@/utils/dayUtils';
import DayNavigation from './DayNavigation';
import UploadForm from './UploadForm';
import AnalyzedView from './AnalyzedView';
import { useSwipe } from './hooks/useSwipe';
import { User, X } from 'lucide-react';
import ProfileScreen from "@/components/ProfileScreen";

// === LOCAL STORAGE KEYS ===
const STORAGE_KEY_DAYS = 'chatbot_days';
const STORAGE_KEY_CURRENT_INDEX = 'chatbot_current_day_index';

export default function Chatbot({ userData }) {
    // =================================================================
    // 1. INITIAL STATE: Try to load from localStorage, fallback to default
    // =================================================================
    const loadInitialData = () => {
        try {
            const savedDays = localStorage.getItem(STORAGE_KEY_DAYS);
            const savedIndex = localStorage.getItem(STORAGE_KEY_CURRENT_INDEX);

            if (savedDays) {
                const parsed = JSON.parse(savedDays);
                // Revive dates (they become strings when stringified)
                const revived = parsed.map(day => ({
                    ...day,
                    date: new Date(day.date), // ← important!
                }));
                return {
                    days: revived,
                    currentIndex: savedIndex ? parseInt(savedIndex, 10) : 0,
                };
            }
        } catch (e) {
            console.error('Failed to load from localStorage', e);
        }

        // Fallback: fresh start
        const freshDays = generateInitialDays();
        return { days: freshDays, currentIndex: 0 };
    };

    const { days: initialDays, currentIndex: initialIndex } = loadInitialData();

    const [days, setDays] = useState(initialDays);
    const [currentDayIndex, setCurrentDayIndex] = useState(initialIndex);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const headerRef = useRef(null);

    const currentDay = days[currentDayIndex];
    const analysis = currentDay?.analysis;

    // =================================================================
    // 2. SAVE TO LOCALSTORAGE whenever days or current index change
    // =================================================================
    useEffect(() => {
        try {
            // Deep clone + convert Dates to ISO strings for JSON serialization
            const toSave = days.map(day => ({
                ...day,
                date: day.date.toISOString(),
            }));
            localStorage.setItem(STORAGE_KEY_DAYS, JSON.stringify(toSave));
            localStorage.setItem(STORAGE_KEY_CURRENT_INDEX, currentDayIndex.toString());
        } catch (e) {
            console.error('Failed to save to localStorage', e);
        }
    }, [days, currentDayIndex]);

    // =================================================================
    // Day switching logic
    // =================================================================
    const switchDay = (index) => {
        if (index >= 0 && index < days.length) {
            setCurrentDayIndex(index);
        }
    };

    const handleAddDay = () => {
        setDays((prev) => {
            const last = prev[prev.length - 1];
            const nextDate = new Date(last.date);
            nextDate.setDate(last.date.getDate() + 1);

            const WEEKDAYS = [
                "Sun", "Mon", "Tue", "Wed",
                "Thu", "Fri", "Sat"
            ];

            const newDay = {
                id: nextDate.toISOString().slice(0, 10),
                date: nextDate,
                dayNumber: nextDate.getDate(),
                weekday: WEEKDAYS[nextDate.getDay()],   // ✔ Correct weekday
                photoUrl: null,
                analysis: null,
                chosenRecipes: [],
            };

            return [...prev, newDay];
        });

        // ✔ Correct: use functional update to get NEW array length
        setCurrentDayIndex((prevIdx) => prevIdx + 1);
    };

    // Swipe support (only on header)
    useSwipe(headerRef, {
        onSwipeLeft: () => switchDay(currentDayIndex + 1),
        onSwipeRight: () => switchDay(currentDayIndex - 1),
        threshold: 70,
    });

    // =================================================================
    // 3. ANALYZE PHOTO – now also saves preview URL to localStorage indirectly via days state
    // =================================================================
    const handleAnalyze = async (file, previewUrl) => {
        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setDays((prev) => {
                const copy = [...prev];
                copy[currentDayIndex] = {
                    ...copy[currentDayIndex],
                    photoUrl: previewUrl,        // ← object URL (works after refresh because we store it)
                    analysis: data,
                    chosenRecipes: copy[currentDayIndex].chosenRecipes || [],
                };
                return copy;
            });
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // =================================================================
    // 4. ADD RECIPE – persists via the same localStorage mechanism
    // =================================================================
    const handleAddRecipe = (recipe) => {
        setDays((prev) => {
            const copy = [...prev];
            const day = copy[currentDayIndex];
            if (!day.chosenRecipes) day.chosenRecipes = [];

            // Avoid duplicates
            if (!day.chosenRecipes.some((r) => r.name === recipe.name)) {
                day.chosenRecipes.push(recipe);
            }
            return copy;
        });
    };

    // Optional: remove a chosen recipe (nice UX)
    const handleRemoveRecipe = (recipeName) => {
        setDays((prev) => {
            const copy = [...prev];
            const day = copy[currentDayIndex];
            day.chosenRecipes = day.chosenRecipes.filter(r => r.name !== recipeName);
            return copy;
        });
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 flex flex-col">
            {/* Swipe zone */}
            <header
                ref={headerRef}
                className="px-10 py-5 border-b border-white/15 flex items-center justify-between select-none cursor-grab active:cursor-grabbing"
            >
                <DayNavigation
                    days={days}
                    currentDayIndex={currentDayIndex}
                    onSwitchDay={switchDay}
                    onAddDay={handleAddDay}
                />
            </header>

            {/* Main content */}
            <main className="flex-1 p-8 overflow-auto">
                {!analysis ? (
                    <UploadForm onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
                ) : (
                    <AnalyzedView
                        photoUrl={currentDay.photoUrl}
                        ingredients={analysis.ingredients || []}
                        recipes={analysis.recipes || []}
                        chosenRecipes={currentDay.chosenRecipes || []}
                        onAddRecipe={handleAddRecipe}
                        onRemoveRecipe={handleRemoveRecipe}
                    />
                )}
            </main>
        </div>
    );
}