// src/components/Alternatives/AlternativesScreen.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, X } from 'lucide-react';
import UploadForm from './UploadForm'; // Correct import path assuming folder structure

const AlternativesScreen = () => {
    const [photoUrl, setPhotoUrl] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleAnalyze = async (file, previewUrl) => {
        setPhotoUrl(previewUrl);
        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        const fd = new FormData();
        fd.append('file', file);

        try {
            const res = await fetch('http://localhost:8000/api/alternative', {
                method: 'POST',
                body: fd,
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setResult(data);
        } catch (err) {
            setError(err.message || 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const reset = () => {
        setPhotoUrl(null);
        setResult(null);
        setError(null);
        setIsAnalyzing(false);
    };

    const Card = ({ children, className = "" }) => (
        <div className={`rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl ${className}`}>
            {children}
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 text-white">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-lg">
                <div className="flex items-center gap-3">
                    <Leaf className="w-7 h-7 text-emerald-400" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                        Healthier Alternatives
                    </h1>
                </div>

                {(photoUrl || result) && (
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-700 rounded-xl transition"
                    >
                        <X className="w-5 h-5" />
                        New Product
                    </button>
                )}
            </header>

            <main className="flex-1 overflow-y-auto p-6 pb-24">
                <div className="max-w-4xl mx-auto">

                    {!photoUrl && !result && (
                        <div className="mt-8">
                            <h2 className="text-center text-3xl font-bold mb-4">
                                Find healthier swaps
                            </h2>
                            <p className="text-center text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
                                Take a photo of any packaged food, oil, snack, or ingredient
                            </p>

                            <UploadForm
                                onAnalyze={handleAnalyze}
                                isLoading={isAnalyzing}
                            />
                        </div>
                    )}


                    {isAnalyzing && photoUrl && (
                        <div className="mt-8">
                            <UploadForm
                                onAnalyze={handleAnalyze} // Not used during loading
                                isLoading={isAnalyzing}
                            />
                        </div>
                    )}


                    {result && !isAnalyzing && (
                        <div className="space-y-8 mt-8">


                            {photoUrl && (
                                <div className="relative max-w-md mx-auto">
                                    <img
                                        src={photoUrl}
                                        alt="Scanned product"
                                        className="w-full rounded-2xl shadow-2xl object-cover"
                                    />
                                    <button
                                        onClick={reset}
                                        className="absolute top-4 right-4 p-3 bg-red-600/90 hover:bg-red-700 rounded-full backdrop-blur-sm transition"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            )}


                            <Card className="text-center py-8">
                                <h2 className="text-3xl font-bold text-orange-300 mb-2">
                                    {result.detected_product}
                                </h2>
                                <p className="text-gray-400 italic mb-6">{result.category}</p>

                                <div className={`
                                    inline-flex items-center gap-3 px-6 py-3 rounded-full text-lg font-semibold mb-6
                                    ${result.assessment === 'great' ? 'bg-emerald-500/20 text-emerald-400' :
                                    result.assessment === 'good' ? 'bg-blue-500/20 text-blue-400' :
                                        result.assessment === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-orange-500/20 text-orange-400'}
                                `}>
                                    {result.assessment === 'great' && 'Great choice!'}
                                    {result.assessment === 'good' && 'Good choice'}
                                    {result.assessment === 'moderate' && 'Can be improved'}
                                    {result.assessment === 'suboptimal' && 'Better options exist'}
                                </div>

                                <p className="text-xl font-medium max-w-2xl mx-auto">{result.message}</p>
                                <p className="text-gray-300 mt-4 max-w-2xl mx-auto leading-relaxed">{result.why}</p>
                            </Card>


                            <div>
                                <h3 className="text-2xl font-bold text-center mb-8 text-emerald-400">
                                    {result.assessment === 'great'
                                        ? 'Excellent alternatives & ideas'
                                        : 'Healthier alternatives'}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {result.alternatives.map((alt, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <Card className="p-6 h-full flex flex-col">
                                                <h4 className="text-xl font-bold text-emerald-400 mb-3">
                                                    {alt.name}
                                                </h4>
                                                <p className="text-gray-300 flex-1 mb-4">
                                                    {alt.why_better_or_similar}
                                                </p>

                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Best for:</span>
                                                        <span className="font-medium text-white">{alt.best_for}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Price (100g/100ml):</span>
                                                        <span className="font-medium text-emerald-400">
                                                            €{(alt.price_per_100ml_eur || alt.price_per_100g_eur || 0).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                                                    <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                                                        {result.assessment === 'great' ? 'Another great option' : 'Healthier choice'}
                                                    </span>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}


                    {error && (
                        <Card className="p-8 text-center text-red-400 mt-8">
                            <p className="text-xl">Error: {error}</p>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AlternativesScreen;