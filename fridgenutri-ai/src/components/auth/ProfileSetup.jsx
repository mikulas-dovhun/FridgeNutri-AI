'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, ArrowRight, AlertCircle } from 'lucide-react'
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
  const [errors, setErrors] = useState({})
  
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
          min: 18,
          max: 100,
          unit: ''
        },
        {
          key: 'gender',
          label: 'Gender',
          type: 'select',
          options: ['Male', 'Female', 'Other']
        }
      ]
    },
    {
      title: '📏 Body Metrics',
      subtitle: 'Your current measurements',
      fields: [
        {
          key: 'height',
          label: 'Height',
          type: 'number',
          placeholder: '175',
          min: 100,
          max: 250,
          unit: 'cm'
        },
        {
          key: 'weight',
          label: 'Weight',
          type: 'number',
          placeholder: '70',
          min: 30,
          max: 300,
          unit: 'kg'
        }
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
  
  // ✅ CORRECT ICON MAPPING FUNCTION
  const getFieldIcon = (fieldKey) => {
    switch (fieldKey) {
      case 'age': return '🎂'
      case 'height': return '📏'
      case 'weight': return '⚖️'
      case 'gender': return '⚧️'
      case 'activityLevel': return '🏃'
      case 'goal': return '🎯'
      default: return '👤'
    }
  }
  
  // ✅ VALIDATION FUNCTION
  const validateField = (fieldKey, value) => {
    const field = currentStepData.fields.find(f => f.key === fieldKey)
    if (!field) return { valid: true }
    
    if (!value || value.toString().trim() === '') {
      return { valid: false, message: `${field.label} is required` }
    }
    
    if (field.type === 'number') {
      const numValue = parseInt(value)
      if (isNaN(numValue)) {
        return { valid: false, message: `${field.label} must be a valid number` }
      }
      if (numValue < field.min) {
        return { valid: false, message: `${field.label} must be at least ${field.min} ${field.unit || ''}` }
      }
      if (numValue > field.max) {
        return { valid: false, message: `${field.label} must be ${field.max} ${field.unit || ''} or less` }
      }
    }
    
    return { valid: true }
  }
  
  // ✅ HANDLE INPUT CHANGE WITH VALIDATION
  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }))
    }
    
    // Validate immediately for number fields
    if (key === 'age' || key === 'height' || key === 'weight') {
      const validation = validateField(key, value)
      if (!validation.valid && value) {
        setErrors(prev => ({ ...prev, [key]: validation.message }))
      }
    }
  }
  
  // ✅ VALIDATE CURRENT STEP
  const isStepComplete = () => {
    return currentStepData.fields.every(field => {
      const value = formData[field.key]
      const validation = validateField(field.key, value)
      return validation.valid
    })
  }
  
  // ✅ HANDLE NEXT WITH FULL VALIDATION
  const handleNext = () => {
    // Validate all fields in current step
    const newErrors = {}
    let hasErrors = false
    
    currentStepData.fields.forEach(field => {
      const value = formData[field.key]
      const validation = validateField(field.key, value)
      if (!validation.valid) {
        newErrors[field.key] = validation.message
        hasErrors = true
      }
    })
    
    if (hasErrors) {
      setErrors(newErrors)
      return
    }
    
    if (!isLastStep) {
      setCurrentStep(currentStep + 1)
      setErrors({})
    } else {
      // Complete profile
      const userData = {
        id: userId,
        displayName: `User ${userId?.slice(-4)}`,
        profile: formData,
        profileComplete: true,
        nutrients: {
          protein: 150,
          carbs: 250,
          fats: 70,
          vitamins: 100,
          minerals: 100,
          water: 3000
        },
        createdAt: Date.now()
      }
      localStorage.setItem('fridgeNutriUser', JSON.stringify(userData))
      onComplete?.(userData)
    }
  }
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      onBack?.()
    }
  }
  
  // ✅ RENDER NUMBER FIELD
  const renderNumberField = (field, index) => (
    <motion.div
      key={field.key}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-3"
    >
      <label className="block text-sm font-semibold text-gray-300 flex items-center">
        <span className="text-2xl mr-2 flex-shrink-0">{getFieldIcon(field.key)}</span>
        <span>{field.label}</span>
      </label>
      
      <div className="relative group">
        <input
          type="number"
          min={field.min}
          max={field.max}
          placeholder={field.placeholder}
          value={formData[field.key]}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          className={cn(
            "w-full px-4 py-4 bg-white/10 backdrop-blur-sm border",
            "rounded-2xl text-white placeholder-gray-400 text-lg focus:outline-none",
            "focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50",
            "transition-all duration-300",
            errors[field.key]
              ? "border-red-500/50 bg-red-500/5"
              : "border-white/20 group-hover:bg-white/15"
          )}
        />
        {field.unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            {field.unit}
          </span>
        )}
      </div>
      
      {errors[field.key] && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errors[field.key]}</span>
        </motion.div>
      )}
    </motion.div>
  )
  
  // ✅ RENDER SELECT FIELD
  const renderSelectField = (field, index) => (
    <motion.div
      key={field.key}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-3"
    >
      <label className="block text-sm font-semibold text-gray-300 flex items-center">
        <span className="text-2xl mr-2 flex-shrink-0">{getFieldIcon(field.key)}</span>
        <span>{field.label}</span>
      </label>
      
      {/* Gender Select */}
      {field.key === 'gender' && (
        <div className="grid grid-cols-3 gap-4">
          {field.options.map((option) => (
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
      )}
      
      {/* Activity Level Select */}
      {field.key === 'activityLevel' && (
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
                  <div className="font-semibold text-white text-sm">{option.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{option.desc}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
      
      {/* Goal Select */}
      {field.key === 'goal' && (
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
      
      {errors[field.key] && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errors[field.key]}</span>
        </motion.div>
      )}
    </motion.div>
  )
  
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
                onClick={handleBack}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>
              
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="text-sm text-gray-300">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                  <Check className="w-4 h-4 text-emerald-400" />
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
              {currentStepData.fields.map((field, index) =>
                field.type === 'number'
                  ? renderNumberField(field, index)
                  : renderSelectField(field, index)
              )}
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