'use client'
import { useState, useEffect } from 'react'
import AuthScreen from '@/components/auth/AuthScreen'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  
  const handleAuthComplete = (user) => {
    setUserData(user)
    setIsAuthenticated(true)
  }
  
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated:', userData)
    }
  }, [isAuthenticated, userData])
  
  if (!isAuthenticated) {
    return <AuthScreen onComplete={handleAuthComplete} />
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950">
      <div className="p-8 text-center text-white">
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
          Welcome Back!
        </h1>
        <p className="text-xl text-gray-300">
          Profile loaded for {userData?.id}
        </p>
        <pre className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-left max-w-2xl mx-auto text-sm">
          {JSON.stringify(userData?.profile, null, 2)}
        </pre>
      </div>
    </div>
  )
}