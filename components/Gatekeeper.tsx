'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/hooks/useRole'

export function Gatekeeper({ children }: { children: React.ReactNode }) {
  const { role, loading, user } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // If no user, redirect to login
    if (!user) {
      router.push('/login')
      return
    }

    // If user exists and role is determined, redirect accordingly
    if (role === 'admin') {
      router.push('/authority-dashboard')
    } else {
      router.push('/citizen-app')
    }
  }, [role, loading, user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Verifying Permissions...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
