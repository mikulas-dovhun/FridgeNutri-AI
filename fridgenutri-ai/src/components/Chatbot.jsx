'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Send, Loader2 } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

export default function Chatbot({ userData }) {
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSend = async () => {
        if (!selectedFile) return

        setIsLoading(true)
        // Add user message with preview
        setMessages(prev => [...prev, { type: 'user', image: previewUrl }])

        const formData = new FormData()
        formData.append('file', selectedFile)

        try {
            const response = await fetch('http://localhost:8000/analyze', {  // Change to your backend URL
                method: 'POST',
                body: formData
            })
            const data = await response.json()

            // Add AI response
            setMessages(prev => [...prev, { type: 'ai', data }])
        } catch (error) {
            setMessages(prev => [...prev, { type: 'ai', error: 'Failed to analyze photo. Try again!' }])
        }

        setIsLoading(false)
        setSelectedFile(null)
        setPreviewUrl(null)
    }

    const handleGetGaps = async (recipeName) => {
        setIsLoading(true)
        try {
            const response = await fetch('http://localhost:8000/gaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipe_name: recipeName })
            })
            const gaps = await response.json()
            // Append gaps to the last AI message
            setMessages(prev => {
                const last = prev[prev.length - 1]
                last.gaps = gaps
                return [...prev]
            })
        } catch (error) {
            console.error(error)
        }
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 p-8">
            <GlassCard className="max-w-4xl mx-auto h-[80vh] flex flex-col">
                {/* Chat Header */}
                <div className="p-6 border-b border-white/20">
                    <h1 className="text-3xl font-bold text-white">FridgeNutri Chat</h1>
                    <p className="text-gray-400">Upload a fridge photo to get recipes!</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex",
                                msg.type === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            <div className={cn(
                                "max-w-[80%] p-4 rounded-2xl",
                                msg.type === 'user' ? 'bg-blue-600/50' : 'bg-purple-600/50'
                            )}>
                                {msg.image && (
                                    <img src={msg.image} alt="Fridge" className="max-w-xs rounded-xl mb-2" />
                                )}
                                {msg.error && <p className="text-red-300">{msg.error}</p>}
                                {msg.data && (
                                    <div className="space-y-4">
                                        <h3 className="text-white font-bold">Ingredients Found:</h3>
                                        <ul className="list-disc pl-4 text-gray-200">
                                            {msg.data.ingredients.map((ing, i) => (
                                                <li key={i}>{ing.name} ({ing.amount})</li>
                                            ))}
                                        </ul>
                                        <h3 className="text-white font-bold">Suggested Recipes:</h3>
                                        <div className="space-y-4">
                                            {msg.data.recipes.map((recipe, i) => (
                                                <div key={i} className="bg-white/10 p-4 rounded-xl">
                                                    <h4 className="text-white text-lg font-semibold">{recipe.name}</h4>
                                                    <p className="text-gray-300">{recipe.instructions}</p>
                                                    <div className="mt-2">
                                                        <span className="text-gray-400">Macros: </span>
                                                        {Object.entries(recipe.macros).map(([k, v]) => `${k}: ${v} `)}
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className="text-gray-400">Micronutrients: </span>
                                                        {Object.entries(recipe.micronutrients).map(([k, v]) => `${k}: ${v} `)}
                                                    </div>
                                                    <button
                                                        onClick={() => handleGetGaps(recipe.name)}
                                                        className="mt-2 text-blue-300 hover:text-blue-100"
                                                    >
                                                        See Nutrient Gaps
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <h3 className="text-white font-bold">Shopping Suggestions:</h3>
                                        <ul className="list-disc pl-4 text-gray-200">
                                            {msg.data.shopping_suggestions.map((sug, i) => <li key={i}>{sug}</li>)}
                                        </ul>
                                        {msg.gaps && (
                                            <div className="mt-4 bg-green-600/30 p-4 rounded-xl">
                                                <h4 className="text-white">Nutrient Gaps for {msg.gaps.chosen_recipe}:</h4>
                                                <pre className="text-gray-200">{JSON.stringify(msg.gaps.still_missing_today, null, 2)}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-white/20">
                    <div className="flex items-center space-x-4">
                        <label className="flex-1 bg-white/10 p-4 rounded-2xl cursor-pointer flex items-center justify-center">
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            <Upload className="w-6 h-6 mr-2 text-gray-300" />
                            <span className="text-gray-300">{selectedFile ? selectedFile.name : 'Upload Fridge Photo'}</span>
                        </label>
                        <button
                            onClick={handleSend}
                            disabled={!selectedFile || isLoading}
                            className="bg-blue-600 text-white p-4 rounded-2xl disabled:opacity-50"
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}