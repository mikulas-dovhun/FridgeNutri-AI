'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import GlassCard from '../ui/GlassCard'

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

export default function ProfileSetup({ onComplete, userId, onBack }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    goal: ''
  })
  
  const steps = [
    {
      title: '👤 Basic Information',
      subtitle: 'Tell us about yourself',
      fields: [
        {
          key: 'age',
          label: 'Age',
          type: 'number',
          placeholder: '25',
          icon: '🎂',
          min: 18,
          max: 100
        },
        {
          key: 'gender',
          label: 'Gender',
          type: 'select',
          options: ['Male', 'Female', 'Other'],
          icon: '👤'
        }
      ]
    },
    {
      title: '📏 Body Metrics',
      subtitle: 'Your current measurements',
      fields: [
        { key: 'height', label: 'Height (cm)', type: 'number', placeholder: '175', icon: '📏', min: 100, max: 250 },
        { key: 'weight', label: 'Weight (kg)', type: 'number', placeholder: '70', icon: '⚖️', min: 30, max: 300 }
      ]
    },
    {
      title: '🏃 Activity Level',
      subtitle: 'How active are you?',
      fields: [{ key: 'activityLevel', label: 'Activity Level', type: 'select' }]
    },
    {
      title: '🎯 Your Goal',
      subtitle: 'What do you want to achieve?',
      fields: [{ key: 'goal', label: 'Fitness Goal', type: 'select' }]
    }
  ]
  
  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  
  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }
  
  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete profile
      const userData = {
        id: userId,
        profile: formData,
        profileComplete: true,
        createdAt: Date.now()
      }
      localStorage.setItem('fridgeNutriUser', JSON.stringify(userData))
      onComplete?.(userData)
    }
  }
  
  const handleBack = () => {
    if (currentStep > 0) {
      // Go back to previous profile step
      setCurrentStep(currentStep - 1)
    } else {
      // Go back to auth screen
      onBack?.()
    }
  }
  
  const isStepComplete = () => {
    return currentStepData.fields.every(field =>
      formData[field.key] && formData[field.key].toString().trim() !== ''
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <GlassCard className="w-full max-w-2xl">
          <div className="space-y-8">
            {/* Progress Header */}
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}  // ✅ FIXED: Now works properly
                className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>
              
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="text-sm text-gray-400">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="w-12 h-12" />
            </div>
            
            {/* Step Content */}
            <div className="text-center space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
              >
                {currentStepData.title}
              </motion.h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                {currentStepData.subtitle}
              </p>
            </div>
            
            {/* Input Fields */}
            <div className="space-y-6">
              {currentStepData.fields.map((field, index) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {field.type === 'number' && (
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <span className="text-2xl">{field.icon}</span>
                      </div>
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        placeholder={field.placeholder}
                        value={formData[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className={cn(
                          "w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl",
                          "text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30",
                          "focus:border-blue-500/50 transition-all duration-300",
                          !formData[field.key] && "group-hover:bg-white/20"
                        )}
                      />
                    </div>
                  )}
                  
                  {field.type === 'select' && field.key === 'gender' && (
                    <div className="grid grid-cols-3 gap-4">
                      {field.options.map((option) => (
                        <motion.button
                          key={option}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleInputChange('gender', option.toLowerCase())}
                          className={cn(
                            "p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20",
                            "hover:bg-white/20 transition-all duration-300 text-left",
                            formData.gender === option.toLowerCase() &&
                            "bg-gradient-to-br from-blue-500/20 border-blue-500/30 ring-2 ring-blue-500/30"
                          )}
                        >
                          <div className="font-semibold text-white">{option}</div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                  
                  {field.type === 'select' && field.key === 'activityLevel' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activityOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange('activityLevel', option.value)}
                          className={cn(
                            "group relative p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20",
                            "hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl",
                            formData.activityLevel === option.value &&
                            "bg-gradient-to-br from-blue-500/20 border-blue-500/30 ring-2 ring-blue-500/30 shadow-blue-500/20"
                          )}
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <span className="text-2xl">{option.icon}</span>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-white">{option.label}</div>
                              <div className="text-sm text-gray-400 mt-1">{option.desc}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                  
                  {field.type === 'select' && field.key === 'goal' && (
                    <div className="grid grid-cols-2 gap-6">
                      {goalOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.05, y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange('goal', option.value)}
                          className={cn(
                            "group relative p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center",
                            "hover:bg-white/20 hover:border-white/30 transition-all duration-500 shadow-xl hover:shadow-2xl",
                            formData.goal === option.value &&
                            `bg-gradient-to-br ${option.color}/20 border-blue-500/30 ring-2 ring-blue-500/30 shadow-blue-500/20`
                          )}
                        >
                          <div className={`w-20 h-20 bg-gradient-to-br ${option.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                            <span className="text-3xl">{option.icon}</span>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-white text-lg">{option.label}</div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Next Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={!isStepComplete()}
              className={cn(
                "group relative w-full py-5 rounded-2xl font-semibold text-lg shadow-xl transition-all duration-500 overflow-hidden",
                isStepComplete()
                  ? "bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:shadow-2xl border border-blue-500/30"
                  : "bg-white/10 text-gray-400 border border-white/20 cursor-not-allowed"
              )}
            >
              <span className="relative flex items-center justify-center">
                {isLastStep ? (
                  <>
                    <span className="mr-2">✨</span>
                    Complete Setup
                  </>
                ) : (
                  <>
                    <span className="mr-2">➡️</span>
                    Next Step
                  </>
                )}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </motion.button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}