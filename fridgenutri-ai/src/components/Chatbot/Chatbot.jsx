// src/components/Chatbot/Chatbot.jsx
'use client';

import { useState, useRef } from 'react';
import { generateInitialDays } from '@/utils/dayUtils';
import DayNavigation from './DayNavigation';
import UploadForm from './UploadForm';
import AnalyzedView from './AnalyzedView';
import { useSwipe } from './hooks/useSwipe';

export default function Chatbot() {
    const [days, setDays] = useState(generateInitialDays());
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Ref для шапки — свайпы будут работать только здесь
    const headerRef = useRef(null);

    const currentDay = days[currentDayIndex];
    const analysis = currentDay.analysis;

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
            return [...prev, {
                ...last,
                date: nextDate,
                dayNumber: nextDate.getDate(),
                id: nextDate.toISOString().slice(0, 10)
            }];
        });
    };

    // Правильный вызов: передаём ref и колбэки
    useSwipe(headerRef, {
        onSwipeLeft: () => switchDay(currentDayIndex + 1),
        onSwipeRight: () => switchDay(currentDayIndex - 1),
        threshold: 70,
    });

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
                    photoUrl: previewUrl,
                    analysis: data,
                    chosenRecipes: [],
                };
                return copy;
            });
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddRecipe = (recipe) => {
        setDays((prev) => {
            const copy = [...prev];
            const day = copy[currentDayIndex];
            if (!day.chosenRecipes) day.chosenRecipes = [];
            if (!day.chosenRecipes.some((r) => r.name === recipe.name)) {
                day.chosenRecipes.push(recipe);
            }
            return copy;
        });
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 flex flex-col">
            {/* Swipe zone — только здесь работают свайпы */}
            <header
                ref={headerRef}
                className="px-10 py-5 border-b border-white/15 flex items-center justify-between select-none cursor-grab active:cursor-grabbing"
            >
                <div>
                    <h1 className="text-3xl font-bold text-white">FridgeNutri Board</h1>
                </div>
                <DayNavigation
                    days={days}
                    currentDayIndex={currentDayIndex}
                    onSwitchDay={switchDay}
                    onAddDay={handleAddDay}
                />
            </header>

            {/* Основной контент */}
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
                    />
                )}
            </main>
        </div>
    );
}