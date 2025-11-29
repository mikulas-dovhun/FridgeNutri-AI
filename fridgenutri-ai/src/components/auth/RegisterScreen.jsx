'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, UserPlus, Mail, ShieldCheck, ArrowRight } from 'lucide-react'  // ✅ ADDED ArrowRight
import { cn } from '@/lib/utils'
import GlassCard from '../ui/GlassCard'

export default function RegisterScreen({ onComplete, onBack }) {
  const [formData, setFormData] = useState({
    displayName: '',
    email: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const handleRegister = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const userId = `user_${Date.now()}`
    const newUser = {
      id: userId,
      displayName: formData.displayName || `User ${userId.slice(-6)}`,
      email: formData.email,
      profileComplete: false,
      createdAt: Date.now()
    }
    
    localStorage.setItem('fridgeNutriUser', JSON.stringify(newUser))
    
    setIsLoading(false)
    onComplete(userId)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <GlassCard className="w-full max-w-md">
          <div className="space-y-8">
            {/* Back Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center absolute top-6 left-6"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            
            {/* Header */}
            <div className="text-center space-y-6 pt-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 30 }}
                className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl"
              >
                <UserPlus className="w-12 h-12 text-white" />
              </motion.div>
              
              <div className="space-y-3">
                <h1 className="text-4xl font-black bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  Create Account
                </h1>
                <p className="text-gray-300 text-lg max-w-sm mx-auto">
                  Set up your FridgeNutri AI account in seconds
                </p>
              </div>
            </div>
            
            {/* Form Fields */}
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <span className="text-2xl">👤</span>
                </div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className={cn(
                    "w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl",
                    "text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30",
                    "focus:border-purple-500/50 transition-all duration-300",
                    !formData.displayName && "group-hover:bg-white/20"
                  )}
                />
              </div>
              
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <span className="text-2xl">📧</span>
                </div>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={cn(
                    "w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl",
                    "text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30",
                    "focus:border-purple-500/50 transition-all duration-300",
                    !formData.email && "group-hover:bg-white/20"
                  )}
                />
              </div>
            </div>
            
            {/* Register Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRegister}
              disabled={isLoading || (!formData.displayName && !formData.email)}
              className={cn(
                "group relative w-full py-5 rounded-2xl font-semibold text-lg shadow-xl transition-all duration-500 overflow-hidden",
                (isLoading || (!formData.displayName && !formData.email))
                  ? "bg-white/10 text-gray-400 border border-white/20 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-700 text-white hover:shadow-2xl border border-purple-500/30"
              )}
            >
              <span className="relative flex items-center justify-center">
                {isLoading ? (
                  <>
                    <span className="mr-2">⏳</span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    <span className="mr-1">✨</span>
                    Create Account
                  </>
                )}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </motion.button>
            
            {/* Skip Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300 text-sm"
            >
              Skip and continue to profile
            </motion.button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}