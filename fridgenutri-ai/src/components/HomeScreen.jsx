'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Home, Utensils, ShoppingBag, User, ChartLine, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'
import GlassCard from './ui/GlassCard'
import ProfileScreen from './ProfileScreen'
import Chatbot from "@/components/Chatbot/Chatbot";
import ProgressScreen from "@/components/ProgressScreen";
import DishChatbot from "@/components/DishToShop/DishChatbot";
import Alternatives from "@/components/AlternativesScreen";

const tabs = [
    { id: 'home', label: 'Home', icon: Home, active: true },
    { id: 'meals', label: 'Meals', icon: Utensils },
    { id: 'groceries', label: 'Groceries', icon: ShoppingBag },
    { id: 'progress', label: 'Progress', icon: ChartLine },
    { id: 'alternatives', label: 'Alternatives', icon: Leaf },
    { id: 'profile', label: 'Profile', icon: User }

]


export default function HomeScreen({ userData }) {
  const [activeTab, setActiveTab] = useState('home')

  let meals = localStorage.getItem("countItems") || 0

  const renderHomeContent = () => (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <GlassCard className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* ✅ CHANGED: Avatar Icon (same as ProfileScreen) */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              Welcome Back, {userData?.displayName?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Snap a photo of your fridge and get personalized meal plans instantly
            </p>
          </div>
        </motion.div>
      </GlassCard>

      {/* Quick Stats */}
      <GlassCard className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Daily Calories', value: '2,100', icon: '🔥', color: 'from-orange-500 to-red-600' },
            { label: 'Meals Planned', value: meals, icon: '🍽️', color: 'from-emerald-500 to-teal-600' },
          { label: 'Groceries Needed', value: '3', icon: '🛒', color: 'from-blue-500 to-indigo-600' },
          { label: 'Fridge Score', value: '92%', icon: '⭐', color: 'from-purple-500 to-pink-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10"
          >
            <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </GlassCard>
      
      {/* Quick Actions */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
          {[
            {
              title: '📸 Scan Fridge',
              description: 'Take a photo of your fridge contents',
              icon: '📷',
              color: 'from-blue-500 to-cyan-500',
              action: 'scanFridge'
            },
            {
              title: '🍽️ Plan Meals',
              description: 'Generate weekly meal plan',
              icon: '🍽️',
              color: 'from-emerald-500 to-green-600',
              action: 'planMeals'
            },
            {
              title: '🛒 Shopping List',
              description: 'Get personalized grocery list',
              icon: '🛒',
              color: 'from-purple-500 to-pink-600',
              action: 'shoppingList'
            },
            {
              title: '⚡ Quick Recipes',
              description: '5-minute recipes from your fridge',
              icon: '⚡',
              color: 'from-orange-500 to-red-600',
              action: 'quickRecipes'
            }
          ].map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={cn(
                "group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10",
                "hover:bg-white/10 hover:border-white/20 transition-all duration-500 shadow-lg hover:shadow-xl",
                "overflow-hidden"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
              <div className="relative flex flex-col items-center space-y-4 text-center">
                <div className={`w-20 h-20 ${action.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
                  <span className="text-3xl">{action.icon}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-white text-lg">{action.title}</h3>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </GlassCard>
      
      {/* Recent Activity */}
      <GlassCard className="p-0">
        <div className="p-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <span className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mr-3"></span>
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { time: '2 hours ago', action: '📸 Scanned fridge', status: 'success' },
              { time: 'Yesterday', action: '🍽️ Generated 7-day meal plan', status: 'success' },
              { time: '2 days ago', action: '🛒 Added 12 items to shopping list', status: 'success' },
              { time: '3 days ago', action: '⚡ Created 3 quick recipes', status: 'success' }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                  <span className="text-lg">{activity.action.split(' ')[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-gray-400 text-sm">{activity.time}</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  )
  
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent()
      case 'meals':
        return (
          <Chatbot userData={userData} />
        )
        case 'groceries':
        return (
          <DishChatbot userData={userData} />
        )
      case 'profile':
        return <ProfileScreen userData={userData} onLogout={() => {
          localStorage.removeItem('fridgeNutriUser')
          window.location.reload()
        }} />
        case 'alternatives':
            return <Alternatives />;
        case 'progress':
            const saved = JSON.parse(localStorage.getItem('chatbot_days')) || [];

            // Convert date strings → Date objects
            const revivedDays = saved.map(d => ({
                ...d,
                date: new Date(d.date)
            }));

            return <ProgressScreen days={revivedDays} />;
        default:
        return renderHomeContent()
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-bounce delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 pt-6 pb-24 px-4">
        {renderContent()}
      </div>
      
      {/* Bottom Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-3xl border-t border-white/20 z-50"
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="grid grid-cols-6 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "group relative p-3 rounded-2xl flex flex-col items-center space-y-2 transition-all duration-300",
                    activeTab === tab.id
                      ? "bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-blue-300"
                      : "text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
                  )}
                >
                  <div className="relative">
                    <Icon className="w-6 h-6" />
                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-30"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium">{tab.label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.div>
    </div>
  )
}