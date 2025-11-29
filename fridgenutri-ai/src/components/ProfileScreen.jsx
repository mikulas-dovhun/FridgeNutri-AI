'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Check, Trash2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import GlassCard from './ui/GlassCard'

const activityOptions = [
  { value: 'sedentary', label: 'Sedentary', icon: '💻', desc: 'Desk job, little exercise' },
  { value: 'light', label: 'Lightly Active', icon: '🏃', desc: 'Light exercise 1-3x/week' },
  { value: 'moderate', label: 'Moderately Active', icon: '🏋️', desc: 'Moderate exercise 3-5x/week' },
  { value: 'very', label: 'Very Active', icon: '⚡', desc: 'Hard exercise 6-7x/week' },
  { value: 'super', label: 'Super Active', icon: '🔥', desc: 'Physical job + hard exercise' }
]

const goalOptions = [
  { value: 'lose', label: 'Lose Weight', icon: '📉', color: 'from-red-500 to-orange-500' },
  { value: 'maintain', label: 'Maintain Weight', icon: '⚖️', color: 'from-blue-500 to-indigo-500' },
  { value: 'gain', label: 'Gain Muscle', icon: '💪', color: 'from-green-500 to-emerald-500' },
  { value: 'health', label: 'General Health', icon: '❤️', color: 'from-purple-500 to-pink-500' }
]

export default function ProfileScreen({ userData, onLogout }) {
  const [formData, setFormData] = useState({
    displayName: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    goal: ''
  })
  const [nutrients, setNutrients] = useState({
    protein: 150,
    carbs: 250,
    fats: 70,
    vitamins: 100,
    minerals: 100,
    water: 3000
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Load user data on mount
  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || '',
        age: userData.profile?.age || '',
        gender: userData.profile?.gender || '',
        height: userData.profile?.height || '',
        weight: userData.profile?.weight || '',
        activityLevel: userData.profile?.activityLevel || '',
        goal: userData.profile?.goal || ''
      })
      setNutrients(userData.nutrients || nutrients)
    }
  }, [userData])
  
  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }
  
  const handleNutrientChange = (key, value) => {
    setNutrients(prev => ({ ...prev, [key]: parseInt(value) || 0 }))
  }
  
  const handleSave = async () => {
    setIsSaving(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const updatedUser = {
      ...userData,
      displayName: formData.displayName,
      profile: formData,
      nutrients,
      profileComplete: true,
      updatedAt: Date.now()
    }
    
    localStorage.setItem('fridgeNutriUser', JSON.stringify(updatedUser))
    setIsEditing(false)
    setIsSaving(false)
    
    window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedUser }))
  }
  
  const handleDeleteAll = () => {
    if (confirm('⚠️ Are you sure? This will delete ALL your data and log you out.')) {
      localStorage.removeItem('fridgeNutriUser')
      onLogout()
    }
  }
  
  return (
    <div className="flex flex-col min-h-[calc(100vh-96px)] bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-bounce delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 relative z-10 pt-6 pb-24 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <GlassCard className="text-center pt-12 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="mx-auto w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                <User className="w-14 h-14 text-white" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  Your Profile
                </h1>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                  Manage your personal information and nutritional preferences
                </p>
              </div>
              
              {/* Edit/Save Button - Inline with content */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isSaving}
                  className={cn(
                    "px-8 py-3 rounded-2xl font-semibold text-lg shadow-xl transition-all duration-300 border flex items-center space-x-2",
                    isEditing
                      ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-500/30 hover:shadow-2xl"
                      : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-500/30 hover:shadow-2xl"
                  )}
                >
                  {isEditing ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <span>✏️</span>
                      <span>Edit Profile</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </GlassCard>
          
          {/* Section 1: About You */}
          <GlassCard className="p-0">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3"></span>
                About You
              </h2>
              
              <div className="space-y-6">
                {/* Row 1: Display Name & Age */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
                      <span className="text-2xl mr-2">👤</span>
                      Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      disabled={!isEditing}
                      className={cn(
                        "w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 text-lg transition-all duration-300",
                        isEditing
                          ? "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                          : "bg-white/5 cursor-not-allowed"
                      )}
                    />
                  </div>
                  
                  {/* Age */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
                      <span className="text-2xl mr-2">🎂</span>
                      Age
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      disabled={!isEditing}
                      className={cn(
                        "w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 text-lg transition-all duration-300",
                        isEditing
                          ? "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                          : "bg-white/5 cursor-not-allowed"
                      )}
                    />
                  </div>
                </div>
                
                {/* Row 2: Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-6 flex items-center">
                    <span className="text-2xl mr-2">⚧️</span>
                    Gender
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-3 gap-4">
                      {['Male', 'Female', 'Other'].map((option) => (
                        <motion.button
                          key={option}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleInputChange('gender', option.toLowerCase())}
                          className={cn(
                            "group relative p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 text-center",
                            "hover:bg-white/20 hover:border-white/30 hover:shadow-xl",
                            formData.gender === option.toLowerCase() &&
                            "bg-gradient-to-br from-blue-500/20 border-blue-500/30 ring-2 ring-blue-500/30 shadow-blue-500/20"
                          )}
                        >
                          <div className="font-semibold text-white text-sm uppercase tracking-wide">
                            {option}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="relative p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-center">
                      <div className="inline-flex items-center justify-center space-x-3">
                        <span className="text-2xl">⚧️</span>
                        <span className="font-semibold text-white text-lg">
                          {formData.gender
                            ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)
                            : 'Select Gender'
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Row 3: Height & Weight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Height */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
                      <span className="text-2xl mr-2">📏</span>
                      Height
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min="100"
                        max="250"
                        placeholder="175"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        disabled={!isEditing}
                        className={cn(
                          "flex-1 px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 text-lg transition-all duration-300",
                          isEditing
                            ? "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                            : "bg-white/5 cursor-not-allowed"
                        )}
                      />
                      <span className="text-gray-400 text-sm font-medium min-w-[24px]">cm</span>
                    </div>
                  </div>
                  
                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
                      <span className="text-2xl mr-2">⚖️</span>
                      Weight
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min="30"
                        max="300"
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        disabled={!isEditing}
                        className={cn(
                          "flex-1 px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 text-lg transition-all duration-300",
                          isEditing
                            ? "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                            : "bg-white/5 cursor-not-allowed"
                        )}
                      />
                      <span className="text-gray-400 text-sm font-medium min-w-[20px]">kg</span>
                    </div>
                  </div>
                </div>
                
                {/* Row 4: Activity Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-6 flex items-center">
                    <span className="text-2xl mr-2">🏃</span>
                    Activity Level
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activityOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange('activityLevel', option.value)}
                          className={cn(
                            "group relative p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20",
                            "hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl",
                            formData.activityLevel === option.value &&
                            "bg-gradient-to-br from-blue-500/20 border-blue-500/30 ring-2 ring-blue-500/30 shadow-blue-500/20"
                          )}
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <span className="text-2xl">{option.icon}</span>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-white text-sm">{option.label}</div>
                              <div className="text-xs text-gray-400 mt-1">{option.desc}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="relative p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                      <div className="flex items-center justify-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl flex items-center justify-center">
                          <span className="text-2xl">🏃</span>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-white text-lg">
                            {formData.activityLevel
                              ? activityOptions.find(opt => opt.value === formData.activityLevel)?.label
                              : 'Select Activity Level'
                            }
                          </div>
                          <div className="text-gray-400 text-sm mt-1">
                            {formData.activityLevel
                              ? activityOptions.find(opt => opt.value === formData.activityLevel)?.desc
                              : 'Choose your activity level'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Row 5: Fitness Goal */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-6 flex items-center">
                    <span className="text-2xl mr-2">🎯</span>
                    Fitness Goal
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-6">
                      {goalOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.05, y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange('goal', option.value)}
                          className={cn(
                            "group relative p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center",
                            "hover:bg-white/20 hover:border-white/30 transition-all duration-500 shadow-xl hover:shadow-2xl",
                            formData.goal === option.value &&
                            `bg-gradient-to-br ${option.color}/20 border-blue-500/30 ring-2 ring-blue-500/30 shadow-blue-500/20`
                          )}
                        >
                          <div className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                            <span className="text-2xl">{option.icon}</span>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-white text-sm">{option.label}</div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="relative p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                      <div className="flex items-center justify-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center">
                          <span className="text-2xl">🎯</span>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-white text-lg">
                            {formData.goal
                              ? goalOptions.find(opt => opt.value === formData.goal)?.label
                              : 'Select Fitness Goal'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
          
          {/* Section 2: Nutrients */}
          <GlassCard className="p-0">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <span className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mr-3"></span>
                Daily Nutrient Goals
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { key: 'protein', label: 'Protein', unit: 'g', icon: '💪' },
                  { key: 'carbs', label: 'Carbohydrates', unit: 'g', icon: '🍞' },
                  { key: 'fats', label: 'Fats', unit: 'g', icon: '🧈' },
                  { key: 'vitamins', label: 'Vitamins', unit: '%', icon: '💊' },
                  { key: 'minerals', label: 'Minerals', unit: '%', icon: '💎' },
                  { key: 'water', label: 'Water', unit: 'ml', icon: '💧' }
                ].map((nutrient) => (
                  <div key={nutrient.key}>
                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
                      <span className="text-2xl mr-2">{nutrient.icon}</span>
                      {nutrient.label}
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min="0"
                        placeholder={nutrient.label}
                        value={nutrients[nutrient.key]}
                        onChange={(e) => handleNutrientChange(nutrient.key, e.target.value)}
                        disabled={!isEditing}
                        className={cn(
                          "flex-1 px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl",
                          "text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30",
                          "focus:border-blue-500/50 transition-all duration-300",
                          !isEditing && "bg-white/5 cursor-not-allowed"
                        )}
                      />
                      <span className="text-gray-400 text-sm font-medium min-w-[24px]">{nutrient.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
      
      {/* Profile Action Buttons - POSITIONED ABOVE BOTTOM NAV */}
      <div className="fixed bottom-[90px] left-0 right-0 px-6 z-40">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Save Button (when editing) - Full width */}
          {isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "w-full group relative py-4 rounded-2xl font-semibold text-lg shadow-xl transition-all duration-500 overflow-hidden",
                isSaving
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-500/30 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:shadow-2xl border border-emerald-500/30"
              )}
            >
              <span className="relative flex items-center justify-center">
                {isSaving ? (
                  <>
                    <span className="mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </span>
            </motion.button>
          )}
          
          {/* Delete All & Logout Button - Full width, RED */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDeleteAll}
            className="w-full group relative py-4 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-500 border border-red-500/30 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-rose-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative flex items-center justify-center space-x-3">
              <Trash2 className="w-5 h-5" />
              <LogOut className="w-5 h-5" />
              <span>Delete All Data & Logout</span>
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}