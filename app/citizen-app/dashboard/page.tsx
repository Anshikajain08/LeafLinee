'use client'

import { useEffect, useState, ComponentType } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

interface Complaint {
  id: string
  title: string
  description: string
  location_lat: number
  location_long: number
  status: string
  severity: string
  created_at: string
  category: {
    name: string
    icon: string
  } | null
}

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic<{
  complaints: Complaint[]
  onSelectComplaint: (complaint: Complaint) => void
  // @ts-ignore
}>(() => import('./MapComponent').then(mod => mod.default), { ssr: false }) as ComponentType<{
  complaints: Complaint[]
  onSelectComplaint: (complaint: Complaint) => void
}>

export default function Dashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)

  // Fetch complaints
  useEffect(() => {
    async function fetchComplaints() {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          id,
          title,
          description,
          location_lat,
          location_long,
          status,
          severity,
          created_at,
          category:categories(name, icon)
        `)
        .not('location_lat', 'is', null)
        .not('location_long', 'is', null)

      if (error) {
        console.error('Error fetching complaints:', error)
        return
      }

      setComplaints((data || []) as unknown as Complaint[])
    }

    fetchComplaints()
  }, [])

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600'
      case 'high': return 'bg-orange-600'
      case 'medium': return 'bg-yellow-600'
      case 'low': return 'bg-green-600'
      default: return 'bg-gray-600'
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="relative w-full h-screen">
      {/* Map Container */}
      <MapComponent 
        complaints={complaints}
        onSelectComplaint={setSelectedComplaint}
      />

      {/* Complaint Card */}
      {selectedComplaint && (
        <div className="absolute top-4 right-4 w-96 bg-white rounded-lg shadow-2xl p-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <button
            onClick={() => setSelectedComplaint(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 text-xs font-medium ${getSeverityColor(selectedComplaint.severity)} text-white rounded-full`}>
                {selectedComplaint.severity}
              </span>
              <span className={`px-3 py-1 text-xs font-medium ${getStatusColor(selectedComplaint.status)} rounded-full`}>
                {selectedComplaint.status.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedComplaint.title}
            </h3>
            {selectedComplaint.category && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{selectedComplaint.category.icon}</span>
                <span>{selectedComplaint.category.name}</span>
              </div>
            )}
          </div>

          <p className="text-gray-700 mb-4">
            {selectedComplaint.description}
          </p>

          <div className="text-sm text-gray-500">
            Reported: {new Date(selectedComplaint.created_at).toLocaleDateString()}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full px-4 py-2 bg-[#00DF81] text-[#032221] font-medium rounded-lg hover:bg-[#00c972] transition-colors">
              Upvote Issue
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Severity</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600"></div>
            <span className="text-sm text-gray-700">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-600"></div>
            <span className="text-sm text-gray-700">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
            <span className="text-sm text-gray-700">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-600"></div>
            <span className="text-sm text-gray-700">Low</span>
          </div>
        </div>
      </div>
    </div>
  )
}
