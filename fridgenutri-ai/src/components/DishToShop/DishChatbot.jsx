// src/components/DishToShop/DishChatbot.jsx
'use client';

import {useState, useRef, useEffect} from 'react';
import DayNavigation from '../Chatbot/DayNavigation';
import UploadForm from './UploadForm';
import AnalyzedDishView from './AnalyzedDishView';
import {useSwipe} from '../Chatbot/hooks/useSwipe';
import {User} from 'lucide-react';


const STORAGE_KEY = 'dishtoshop_days';
const STORAGE_INDEX = 'dishtoshop_current_index';

export default function DishChatbot() {
    const loadData = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const index = localStorage.getItem(STORAGE_INDEX);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    days: parsed.map(d => ({...d, date: new Date(d.date)})),
                    currentIndex: index ? parseInt(index) : 0
                };
            }
        } catch (e) {
            console.error(e);
        }

        const today = new Date();
        const days = Array.from({length: 7}, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            return {
                id: date.toISOString().slice(0, 10),
                date,
                dayNumber: date.getDate(),
                weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
                photoUrl: null,
                analysis: null
            };
        });
        return {days, currentIndex: 0};
    };

    const [{days, currentIndex}, setState] = useState(loadData);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const headerRef = useRef(null);

    const currentDay = days[currentIndex];
    const analysis = currentDay?.analysis;

    const deleteDay = (index) => {
        if (!confirm("Delete this day?")) return;

        setState(prev => {
            const {days, currentIndex} = prev;

            if (days.length === 1) {
                alert("You cannot delete the last remaining day.");
                return prev;
            }

            const updated = days.filter((_, i) => i !== index);

            let newIndex = currentIndex;

            // Adjust the current day index
            if (currentIndex >= updated.length) {
                newIndex = updated.length - 1;
            } else if (index < currentIndex) {
                newIndex = currentIndex - 1;
            }

            return {
                days: updated,
                currentIndex: newIndex
            };
        });
    };


    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(
            days.map(d => ({...d, date: d.date.toISOString()}))
        ));
        localStorage.setItem(STORAGE_INDEX, currentIndex.toString());
    }, [days, currentIndex]);

    useSwipe(headerRef, {
        onSwipeLeft: () => currentIndex < days.length - 1 && setState(s => ({...s, currentIndex: s.currentIndex + 1})),
        onSwipeRight: () => currentIndex > 0 && setState(s => ({...s, currentIndex: s.currentIndex - 1})),
    });

    const switchDay = (i) => setState(s => ({...s, currentIndex: i}));

    const addDay = () => {
        setState(s => {
            const last = s.days[s.days.length - 1];
            const next = new Date(last.date);
            next.setDate(next.getDate() + 1);
            const newDay = {
                id: next.toISOString().slice(0, 10),
                date: next,
                dayNumber: next.getDate(),
                weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][next.getDay()],
                photoUrl: null,
                analysis: null
            };
            return {days: [...s.days, newDay], currentIndex: s.days.length};
        });
    };

    const handleAnalyze = async (file, previewUrl) => {
        setIsAnalyzing(true);
        const fd = new FormData();
        fd.append('file', file);

        try {
            const res = await fetch('http://localhost:8000/analyze/dish', {method: 'POST', body: fd});
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setState(s => {
                const copy = [...s.days];
                copy[s.currentIndex] = {...copy[s.currentIndex], photoUrl: previewUrl, analysis: data};
                return {...s, days: copy};
            });
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        // THIS IS THE KEY FIX → full viewport, no parent constraints
        <div
            className="min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-pink-950 via-purple-950 to-indigo-950 text-white">
            <header
                ref={headerRef}
                className="relative z-10 px-8 py-5 border-b border-white/10 flex justify-between items-center cursor-grab active:cursor-grabbing select-none"
            >
                <DayNavigation
                    days={days}
                    currentDayIndex={currentIndex}
                    onSwitchDay={switchDay}
                    onAddDay={addDay}
                    onDeleteDay={deleteDay}
                />

            </header>

            <main className="flex-1 overflow-y-auto">
                <div className="min-h-full flex flex-col">
                    {!analysis ? (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <UploadForm onAnalyze={handleAnalyze} isLoading={isAnalyzing}/>
                        </div>
                    ) : (
                        <div className="p-8">
                            <AnalyzedDishView photoUrl={currentDay.photoUrl} analysis={analysis}/>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}