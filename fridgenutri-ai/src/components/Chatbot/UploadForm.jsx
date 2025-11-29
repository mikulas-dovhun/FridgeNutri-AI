// src/components/Chatbot/UploadForm.jsx
'use client';

import { Upload, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function UploadForm({ onAnalyze, isLoading }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        const url = URL.createObjectURL(selected);
        setFile(selected);
        setPreview(url);
    };

    const handleRemove = () => {
        if (preview) URL.revokeObjectURL(preview);
        setFile(null);
        setPreview(null);
    };

    const handleSubmit = () => {
        if (file && preview) {
            onAnalyze(file, preview);
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-[520px] bg-white/5 border border-white/15 rounded-3xl p-10 backdrop-blur-lg">
                <h2 className="text-white text-2xl font-bold text-center mb-8">
                    Upload image of your fridge
                </h2>

                <div className="relative w-full h-96 bg-black/30 rounded-2xl overflow-hidden mb-6 border-2 border-dashed border-white/30">
                    {preview ? (
                        <>
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                onClick={handleRemove}
                                className="absolute top-4 right-4 bg-red-600 hover:bg-red-500 text-white p-3 rounded-full transition"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Upload className="w-20 h-20 mb-4" />
                            <p className="text-lg">Select photo</p>
                        </div>
                    )}
                </div>

                <label className="block">
                    <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
                    <div className="bg-white/10 hover:bg-white/20 rounded-xl px-6 py-4 text-center cursor-pointer transition border border-white/20">
                        <Upload className="w-5 h-5 inline mr-2" />
                        {file ? file.name : 'Choose photo'}
                    </div>
                </label>

                <button
                    onClick={handleSubmit}
                    disabled={!file || isLoading}
                    className={`
            mt-6 w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition
            ${file && !isLoading
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg'
                        : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    }
          `}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Analyzing
                        </>
                    ) : (
                        'Start Analysis'
                    )}
                </button>
            </div>
        </div>
    );
}