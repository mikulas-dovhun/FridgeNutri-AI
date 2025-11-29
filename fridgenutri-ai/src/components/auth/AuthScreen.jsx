'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, User, Shield, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import GlassCard from '../ui/GlassCard'
import ProfileSetup from './ProfileSetup'
import RegisterScreen from './RegisterScreen'  // ✅ NEW IMPORT

export default function AuthScreen({ onComplete }) {
  const [currentScreen, setCurrentScreen] = useState('auth')  // ✅ auth, register, profile
  const [userId, setUserId] = useState('')
  
  useEffect(() => {
    const savedUser = localStorage.getItem('fridgeNutriUser')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      if (userData.profileComplete) {
        onComplete?.(userData)
        return
      }
      setUserId(userData.id)
      setCurrentScreen('profile')
    }
  }, [onComplete])
  
  const handleGuest = () => {
    const newUser = {
      id: `guest_${Date.now()}`,
      profileComplete: false,
      createdAt: Date.now()
    }
    localStorage.setItem('fridgeNutriUser', JSON.stringify(newUser))
    setUserId(newUser.id)
    setCurrentScreen('profile')
  }
  
  const handleRegister = () => {
    setCurrentScreen('register')  // ✅ Go to Register screen
  }
  
  const handleRegisterComplete = (userId) => {
    setUserId(userId)
    setCurrentScreen('profile')  // ✅ Then ProfileSetup
  }
  
  const handleLogin = () => {
    const savedUser = localStorage.getItem('fridgeNutriUser')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      if (userData.id === userId && userData.profileComplete) {
        onComplete?.(userData)
      } else if (userData.id === userId) {
        setCurrentScreen('profile')
      }
    }
  }
  
  if (currentScreen === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* ... existing auth screen JSX stays the same ... */}
        <GlassCard className="w-full max-w-md">
          <div className="text-center space-y-8">
            {/* Logo and title - same as before */}
            <motion.div
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 300, damping: 30 }}
              className="mx-auto w-28 h-28 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center shadow-2xl"
            >
              <Shield className="w-14 h-14 text-white drop-shadow-lg" />
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                FridgeNutri AI
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-sm mx-auto">
                Your intelligent kitchen assistant
              </p>
            </div>
            
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGuest}
                className="group relative w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-500 border border-emerald-500/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative flex items-center justify-center">
                  <span className="mr-3">🚀</span>
                  Continue as Guest
                </span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegister}  // ✅ Now goes to Register screen
                className="group relative w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-500 border border-purple-500/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative flex items-center justify-center">
                  <UserPlus className="w-5 h-5 mr-3" />
                  <span className="mr-1">✨</span>
                  Create Account
                </span>
              </motion.button>
            </div>
            
            {/* OR Divider + Login section - same as before */}
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="flex-shrink-0 px-4 text-sm text-gray-400 uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>
            
            <div className="relative my-6">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-blue-500/5 rounded-2xl blur" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your ID to login..."
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-lg"
                  />
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={!userId.trim()}
              className="group relative w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r from-blue-600 to-purple-700 text-white py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-500 border border-blue-500/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center justify-center">
                <span className="mr-3">🔑</span>
                Login to Account
              </span>
            </motion.button>
          </div>
        </GlassCard>
      </div>
    )
  }
  
  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        onComplete={handleRegisterComplete}
        onBack={() => setCurrentScreen('auth')}
      />
    )
  }
  
  if (currentScreen === 'profile') {
    return (
      <ProfileSetup
        onComplete={onComplete}
        userId={userId}
        onBack={() => setCurrentScreen('auth')}
      />
    )
  }
}