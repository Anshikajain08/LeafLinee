'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRole } from '@/hooks/useRole'
import Header from '@/components/Header'

export default function AuthorityDashboard() {
  const router = useRouter()
  const { role, loading, user } = useRole()
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!DEV_BACKDOOR && !loading) {
      if (!user) {
        router.push('/login')
      } else if (role !== 'admin') {
        router.push('/citizen-app')
      }
    }
  }, [role, loading, user, router])

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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!DEV_BACKDOOR && (!user || role !== 'admin')) return null

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="absolute top-24 right-8 flex items-center space-x-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <span className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full">
            Admin
          </span>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to the Authority Dashboard
            </h2>
            <p className="text-gray-600">
              You have administrative access. Build your admin features here.
            </p>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}