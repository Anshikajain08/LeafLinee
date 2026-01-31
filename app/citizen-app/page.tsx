'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRole } from '@/hooks/useRole'

// Development backdoor - set to false in production
const DEV_BACKDOOR = true

export default function CitizenApp() {
  const router = useRouter()
  const { role, loading, user } = useRole()
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!DEV_BACKDOOR && !loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      setSigningOut(false)
    }
  }

  if (!DEV_BACKDOOR && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading App...</p>
        </div>
      </div>
    )
  }

  if (!DEV_BACKDOOR && !user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Citizen App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email || 'Dev Mode'}</span>
              <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                {DEV_BACKDOOR && !user ? 'Dev Access' : role === 'citizen' ? 'Citizen' : 'User'}
              </span>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {signingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to the Citizen App
            </h2>
            <p className="text-gray-600">
              You have citizen access. Build your citizen features here.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
