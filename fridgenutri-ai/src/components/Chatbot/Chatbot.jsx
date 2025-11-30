// src/components/Chatbot/Chatbot.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { generateInitialDays } from '@/utils/dayUtils';
import DayNavigation from './DayNavigation';
import UploadForm from './UploadForm';
import AnalyzedView from './AnalyzedView';
import { useSwipe } from './hooks/useSwipe';
import { User, X } from 'lucide-react';

const STORAGE_KEY_DAYS = 'chatbot_days';
const STORAGE_KEY_CURRENT_INDEX = 'chatbot_current_day_index';

export default function Chatbot({ userData }) {
    const loadInitialData = () => {
        try {
            const savedDays = localStorage.getItem(STORAGE_KEY_DAYS);
            const savedIndex = localStorage.getItem(STORAGE_KEY_CURRENT_INDEX);
            
            if (savedDays) {
                const parsed = JSON.parse(savedDays);
                const revived = parsed.map(day => ({
                    ...day,
                    date: new Date(day.date),
                }));
                return {
                    days: revived,
                    currentIndex: savedIndex ? parseInt(savedIndex, 10) : 0,
                };
            }
        } catch (e) {
            console.error('Failed to load from localStorage', e);
        }
        
        return { days: generateInitialDays(), currentIndex: 0 };
    };
    
    const { days: initialDays, currentIndex: initialIndex } = loadInitialData();
    
    const [days, setDays] = useState(initialDays);
    const [currentDayIndex, setCurrentDayIndex] = useState(initialIndex);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const headerRef = useRef(null);
    const currentDay = days[currentDayIndex];
    const analysis = currentDay?.analysis;
    
    // Save to localStorage
    useEffect(() => {
        try {
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
    
    // Swipe navigation
    useSwipe(headerRef, {
        onSwipeLeft: () => currentDayIndex < days.length - 1 && setCurrentDayIndex(i => i + 1),
        onSwipeRight: () => currentDayIndex > 0 && setCurrentDayIndex(i => i - 1),
        threshold: 70,
    });
    
    const switchDay = (index) => {
        if (index >= 0 && index < days.length) setCurrentDayIndex(index);
    };
    
    const handleAddDay = () => {
        setDays(prev => {
            const last = prev[prev.length - 1];
            const nextDate = new Date(last.date);
            nextDate.setDate(last.date.getDate() + 1);
            
            const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const newDay = {
                id: nextDate.toISOString().slice(0, 10),
                date: nextDate,
                dayNumber: nextDate.getDate(),
                weekday: WEEKDAYS[nextDate.getDay()],
                photoUrl: null,
                analysis: null,
                chosenRecipes: [],
            };
            return [...prev, newDay];
        });
        setCurrentDayIndex(days.length);
    };
    
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
            
            setDays(prev => {
                const copy = [...prev];
                copy[currentDayIndex] = {
                    ...copy[currentDayIndex],
                    photoUrl: previewUrl,
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
    
    const handleAddRecipe = (recipe) => {
        setDays(prev => {
            const copy = [...prev];
            const day = copy[currentDayIndex];
            if (!day.chosenRecipes) day.chosenRecipes = [];
            if (!day.chosenRecipes.some(r => r.name === recipe.name)) {
                day.chosenRecipes.push(recipe);
            }
            return copy;
        });
    };
    
    const handleRemoveRecipe = (recipeName) => {
        setDays(prev => {
            const copy = [...prev];
            copy[currentDayIndex].chosenRecipes = copy[currentDayIndex].chosenRecipes.filter(
              r => r.name !== recipeName
            );
            return copy;
        });
    };
    
    return (
      // THIS IS THE KEY FIX: full viewport, no parent interference
      <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 text-white overflow-hidden">
          {/* Header – swipe zone */}
          <header
            ref={headerRef}
            className="relative z-10 px-10 py-5 border-b border-white/15 flex items-center justify-between select-none cursor-grab active:cursor-grabbing"
          >
              <DayNavigation
                days={days}
                currentDayIndex={currentDayIndex}
                onSwitchDay={switchDay}
                onAddDay={handleAddDay}
              />
          </header>
          
          {/* Main content – takes all remaining space */}
          <main className="flex-1 overflow-y-auto p-8 pb-20">
              <div className="max-w-5xl mx-auto w-full">
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
              </div>
          </main>
      </div>
    );
}