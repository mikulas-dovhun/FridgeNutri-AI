'use client'
import { useState, useEffect } from 'react'
import AuthScreen from '@/components/auth/AuthScreen'
import HomeScreen from "@/components/HomeScreen";
import Chatbot from "@/components/Chatbot/Chatbot";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  
  const handleAuthComplete = (user) => {
    setUserData(user)
    setIsAuthenticated(true)
    console.log('✅ User authenticated:', user)
  }
  
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated:', userData)
    }
  }, [isAuthenticated, userData])
  
  if (!isAuthenticated) {
    return <AuthScreen onComplete={handleAuthComplete} />
  }
  
  return <HomeScreen userData={userData} />
}