// src/components/Chatbot/Chatbot.tsx
'use client';

import { useState } from 'react';
import { generateInitialDays } from '@/utils/dayUtils';
import DayNavigation from './DayNavigation';
import UploadForm from './UploadForm';
import AnalyzedView from './AnalyzedView';
import { useSwipe } from './hooks/useSwipe';

export default function Chatbot() {
    const [days, setDays] = useState(generateInitialDays());
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const currentDay = days[currentDayIndex];
    const analysis = currentDay.analysis as any;

    const switchDay = (index: number) => {
        if (index >= 0 && index < days.length) {
            setCurrentDayIndex(index);
        }
    };

    const handleAddDay = () => {
        setDays((prev) => {
            const last = prev[prev.length - 1];
            const nextDate = new Date(last.date);
            nextDate.setDate(last.date.getDate() + 1);
            return [...prev, { ...last, date: nextDate, dayNumber: nextDate.getDate(), id: nextDate.toISOString().slice(0, 10) }];
        });
    };

    // Swipe handlers
    const goToNextDay = () => switchDay(currentDayIndex + 1);
    const goToPrevDay = () => switchDay(currentDayIndex - 1);

    // Enable swipe globally when not analyzing
    useSwipe({
        onSwipeLeft: goToNextDay,
        onSwipeRight: goToPrevDay,
    });

    const handleAnalyze = async (file: File, previewUrl: string) => {
        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:8000/analyze', { method: 'POST', body: formData });
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
            alert('Error: ' + (err as Error).message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddRecipe = (recipe: any) => {
        setDays((prev) => {
            const copy = [...prev];
            const day = copy[currentDayIndex];
            if (!day.chosenRecipes) day.chosenRecipes = [];
            if (!day.chosenRecipes.some((r: any) => r.name === recipe.name)) {
                day.chosenRecipes.push(recipe);
            }
            return copy;
        });
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 flex flex-col">
            {/* Header */}
            <header className="px-10 py-5 border-b border-white/15 flex items-center justify-between">
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

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-hidden">
                {!analysis ? (
                    <UploadForm onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
                ) : (
                    <AnalyzedView
                        photoUrl={currentDay.photoUrl!}
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