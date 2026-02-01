'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRole } from '@/hooks/useRole'
import Header from '@/components/Header'

// Development backdoor - set to false in production
const DEV_BACKDOOR = true

export default function CitizenApp() {
  const router = useRouter()
  const { role, loading, user } = useRole()

  useEffect(() => {
    if (!DEV_BACKDOOR && !loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  if (!DEV_BACKDOOR && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBD4]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00DF81] mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading App...</p>
        </div>
      </div>
    )
  }

  if (!DEV_BACKDOOR && !user) return null

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FDFBD4] pt-24">
        <div className="absolute top-24 right-8 flex items-center space-x-4 z-10">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
            {role === 'citizen' ? 'Citizen' : 'User'}
          </span>
        </div>

        <main className="max-w-7xl mx-auto py-12 px-6">
          <h1 className="text-5xl font-bold text-[#032221] mb-4">Citizen Portal</h1>
          <p className="text-lg text-gray-700 mb-12">
            Report civic issues, track progress, and contribute to a cleaner Delhi
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dashboard Card */}
            <Link
              href="/citizen-app/dashboard"
              className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
            >
              <div className="p-8 bg-gradient-to-br from-[#00DF81] to-[#00c972]">
                <svg
                  className="w-16 h-16 text-[#032221] mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-[#032221]">Dashboard</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  View all reported issues on an interactive map. See real-time status updates and issue clusters.
                </p>
                <div className="flex items-center text-[#00DF81] font-medium group-hover:translate-x-2 transition-transform">
                  Open Dashboard
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Report Issue Card */}
            <Link
              href="/citizen-app/report"
              className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
            >
              <div className="p-8 bg-gradient-to-br from-[#829c86] to-[#6d8371]">
                <svg
                  className="w-16 h-16 text-white mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-white">Report Issue</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Submit a new civic complaint with photos, location, and detailed description.
                </p>
                <div className="flex items-center text-[#829c86] font-medium group-hover:translate-x-2 transition-transform">
                  Create Report
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* My Reports Card */}
            <Link
              href="/citizen-app/my-reports"
              className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
            >
              <div className="p-8 bg-gradient-to-br from-[#032221] to-[#021918]">
                <svg
                  className="w-16 h-16 text-[#00DF81] mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-[#00DF81]">My Activity</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Track all your submitted reports, provide feedback on resolved issues, and reopen if needed.
                </p>
                <div className="flex items-center text-[#032221] font-medium group-hover:translate-x-2 transition-transform">
                  View My Reports
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-[#00DF81] mb-2">--</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">--</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">--</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-[#829c86] mb-2">--</div>
              <div className="text-sm text-gray-600">Community Impact</div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}