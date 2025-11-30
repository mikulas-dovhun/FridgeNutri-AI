// src/components/Chatbot/UploadForm.jsx
'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

export default function UploadForm({ onAnalyze, isLoading }) {
    const [dragActive, setDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Handle files (from click or drop)
    const processFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Create preview URL (this works even after refresh because it's saved in localStorage)
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // Trigger analysis
        onAnalyze(file, url);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files?.length) {
            processFile(files[0]);
        }
    };

    const handleChange = (e) => {
        const files = e.target.files;
        if (files?.length) {
            processFile(files[0]);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <label
                htmlFor="dropzone-file"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative flex flex-col items-center justify-center w-full h-96 
                    border-4 border-dashed rounded-2xl cursor-pointer 
                    transition-all duration-300
                    ${dragActive
                    ? 'border-purple-400 bg-purple-900/30 shadow-2xl shadow-purple-500/20'
                    : 'border-white/30 bg-white/5 hover:bg-white/10'
                }
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                `}
            >
                {/* Hidden native file input */}
                <input
                    id="dropzone-file"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    disabled={isLoading}
                />

                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-8 text-center">
                    {previewUrl ? (
                        // Show preview when image is selected
                        <div className="relative">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-h-64 rounded-lg shadow-2xl"
                            />
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400"></div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className={`p-6 rounded-full mb-6 transition-all ${dragActive ? 'bg-purple-600 scale-110' : 'bg-white/10'}`}>
                                {dragActive ? (
                                    <Upload className="w-16 h-16 text-purple-300" />
                                ) : (
                                    <ImageIcon className="w-16 h-16 text-white/60" />
                                )}
                            </div>

                            <p className="mb-2 text-2xl font-semibold text-white">
                                {dragActive ? 'Drop your photo here!' : 'Drag & drop your fridge photo'}
                            </p>
                            <p className="text-sm text-white/60">
                                or <span className="text-purple-400 underline">click to browse</span>
                            </p>
                            <p className="mt-4 text-xs text-white/40">
                                Supports JPG, PNG, WebP
                            </p>
                        </>
                    )}
                </div>

                {/* Loading overlay */}
                {isLoading && !previewUrl && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-2xl">
                        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-400 mb-6"></div>
                        <p className="text-xl text-white">Analyzing your product...</p>
                    </div>
                )}
            </label>
        </div>
    );
}