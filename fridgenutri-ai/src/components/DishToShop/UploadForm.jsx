// src/components/DishToShop/UploadForm.jsx
'use client';

import { useState, useRef } from 'react';
import { Upload, Camera, ShoppingCart } from 'lucide-react';

export default function UploadForm({ onAnalyze, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  
  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload an image');
      return;
    }
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
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
    if (e.dataTransfer.files?.length) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e) => {
    if (e.target.files?.length) {
      processFile(e.target.files[0]);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <label
        htmlFor="dish-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
                    relative flex flex-col items-center justify-center w-full h-96
                    border-4 border-dashed rounded-3xl cursor-pointer transition-all duration-300
                    ${dragActive
          ? 'border-emerald-400 bg-emerald-900/30 shadow-2xl shadow-emerald-500/30'
          : 'border-white/30 bg-white/5 hover:bg-white/10'
        }
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                `}
      >
        <input
          id="dish-dropzone"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-8 text-center">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Your dish"
                className="max-h-64 rounded-2xl shadow-2xl"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-2xl">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-400"></div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className={`p-8 rounded-full mb-8 transition-all ${dragActive ? 'bg-emerald-600 scale-110' : 'bg-white/10'}`}>
                {dragActive ? (
                  <ShoppingCart className="w-20 h-20 text-emerald-300" />
                ) : (
                  <Camera className="w-20 h-20 text-white/60" />
                )}
              </div>
              
              <p className="mb-3 text-3xl font-bold text-white">
                {dragActive ? 'Drop your photo!' : 'Snap a photo of any dish'}
              </p>
              <p className="text-lg text-white/80 mb-4 max-w-md">
                I’ll instantly tell you the recipe + where to buy everything cheapest
              </p>
              <p className="text-sm text-white/60">
                or <span className="text-emerald-400 underline">click to upload</span>
              </p>
              <p className="mt-6 text-xs text-white/40">
                JPG, PNG, WebP • Works with restaurant food, homemade, anything!
              </p>
            </>
          )}
        </div>
        
        {isLoading && !previewUrl && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-3xl backdrop-blur">
            <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-emerald-400 mb-8"></div>
            <p className="text-2xl font-bold text-white">Detecting dish & finding cheapest prices...</p>
            <p className="text-sm text-white/70 mt-4">Takes 5–10 seconds</p>
          </div>
        )}
      </label>
    </div>
  );
}