'use client'

import { useEffect, useState, ComponentType } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

// --- Types ---
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

type ViewState = 'portal' | 'dashboard' | 'report' | 'activity'

// --- Map Component (Dynamically Imported) ---
const MapComponent = dynamic<{
  complaints: Complaint[]
  onSelectComplaint: (complaint: Complaint) => void
  // @ts-ignore
}>(() => import('./MapComponent').then(mod => mod.default), { ssr: false }) as ComponentType<{
  complaints: Complaint[]
  onSelectComplaint: (complaint: Complaint) => void
}>

export default function CitizenApp() {
  const [currentView, setCurrentView] = useState<ViewState>('portal')
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)

  // --- Data Fetching (Only triggers when needed) ---
  useEffect(() => {
    if (currentView === 'dashboard') {
      async function fetchComplaints() {
        const { data, error } = await supabase
          .from('complaints')
          .select(`
            id, title, description, location_lat, location_long, 
            status, severity, created_at, category:categories(name, icon)
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
    }
  }, [currentView])

  // --- Helper: Badge Colors (Updated for Beige/Blue Theme) ---
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-[#B95D5D]' // Muted Red
      case 'high': return 'bg-[#D68C45]'    // Muted Orange
      case 'medium': return 'bg-[#D4B468]'  // Muted Yellow
      case 'low': return 'bg-[#6B8E6B]'     // Muted Green
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-[#E3F2FD] text-[#467398]'
      case 'resolved': return 'bg-[#E8F5E9] text-[#4A7051]'
      default: return 'bg-[#F5F5F5] text-gray-600'
    }
  }

  // --- View: Portal Landing (The Redesign) ---
  if (currentView === 'portal') {
    return (
      <div className="min-h-screen bg-[#F9F7F2] p-8 md:p-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-serif font-bold text-[#2C3E50] mb-3">
              Citizen Portal
            </h1>
            <p className="text-[#64748B] text-lg">
              Report civic issues, track progress, and contribute to a cleaner city.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Dashboard (Blue Theme) */}
            <div 
              onClick={() => setCurrentView('dashboard')}
              className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#EAEaea]"
            >
              <div className="h-40 bg-[#A8D0E6] flex flex-col justify-center items-center p-6 relative overflow-hidden">
                {/* Decorative circle */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full" />
                <svg className="w-16 h-16 text-[#2C4A52] relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7" />
                </svg>
                <h2 className="text-2xl font-bold text-[#1A2E2C] mt-4">Dashboard</h2>
              </div>
              <div className="p-6">
                <p className="text-[#64748B] mb-6 min-h-[3rem]">
                  View all reported issues on an interactive map. See real-time status updates and issue clusters.
                </p>
                <span className="inline-flex items-center text-[#2C4A52] font-semibold group-hover:translate-x-1 transition-transform">
                  Open Dashboard 
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </div>
            </div>

            {/* Card 2: Report Issue (Beige Theme) */}
            <div className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#EAEaea]">
              <div className="h-40 bg-[#E3D5CA] flex flex-col justify-center items-center p-6 relative overflow-hidden">
                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full" />
                <svg className="w-16 h-16 text-[#5D4037] relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-2xl font-bold text-[#3E2723] mt-4">Report Issue</h2>
              </div>
              <div className="p-6">
                <p className="text-[#64748B] mb-6 min-h-[3rem]">
                  Submit a new civic complaint with photos, location, and detailed description.
                </p>
                <span className="inline-flex items-center text-[#8D6E63] font-semibold group-hover:translate-x-1 transition-transform">
                  Create Report
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </div>
            </div>

            {/* Card 3: My Activity (Dark Teal/Grey Theme) */}
            <div className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#EAEaea]">
              <div className="h-40 bg-[#546E7A] flex flex-col justify-center items-center p-6 relative overflow-hidden">
                <div className="absolute top-2 right-10 w-16 h-16 bg-white/10 rounded-full" />
                <svg className="w-16 h-16 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-2xl font-bold text-white mt-4">My Activity</h2>
              </div>
              <div className="p-6">
                <p className="text-[#64748B] mb-6 min-h-[3rem]">
                  Track all your submitted reports, provide feedback on resolved issues, and reopen if needed.
                </p>
                <span className="inline-flex items-center text-[#455A64] font-semibold group-hover:translate-x-1 transition-transform">
                  View My Reports
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }

  // --- View: Dashboard Map (The Logic) ---
  return (
    <div className="relative w-full h-screen bg-[#F0F4F8]">
      {/* Back Button */}
      <button 
        onClick={() => setCurrentView('portal')}
        className="absolute top-4 left-4 z-50 bg-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 text-[#546E7A] font-medium flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Portal
      </button>

      {/* Map Container */}
      <MapComponent 
        complaints={complaints}
        onSelectComplaint={setSelectedComplaint}
      />

      {/* Complaint Details Card (Styled for Beige Theme) */}
      {selectedComplaint && (
        <div className="absolute top-4 right-4 w-96 bg-[#FDFBF7] rounded-xl shadow-2xl p-6 max-h-[calc(100vh-2rem)] overflow-y-auto border border-[#EAEaea] z-50">
          <button
            onClick={() => setSelectedComplaint(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 text-xs font-medium ${getSeverityColor(selectedComplaint.severity)} text-white rounded-full`}>
                {selectedComplaint.severity}
              </span>
              <span className={`px-3 py-1 text-xs font-medium ${getStatusColor(selectedComplaint.status)} rounded-full border border-gray-100`}>
                {selectedComplaint.status.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#2C3E50] mb-2">
              {selectedComplaint.title}
            </h3>
            {selectedComplaint.category && (
              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <span>{selectedComplaint.category.icon}</span>
                <span>{selectedComplaint.category.name}</span>
              </div>
            )}
          </div>

          <p className="text-[#4A4A4A] mb-6 leading-relaxed">
            {selectedComplaint.description}
          </p>

          <div className="text-sm text-[#8D8D8D] bg-[#F5F2EB] p-3 rounded-lg mb-6">
            Reported: {new Date(selectedComplaint.created_at).toLocaleDateString()}
          </div>

          <div className="pt-4 border-t border-[#EAEaea]">
            <button className="w-full px-4 py-3 bg-[#A8D0E6] text-[#1A2E2C] font-semibold rounded-lg hover:bg-[#97C5DE] transition-colors shadow-sm">
              Upvote Issue
            </button>
          </div>
        </div>
      )}

      {/* Map Legend (Styled) */}
      <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-[#EAEaea] z-40">
        <h4 className="font-serif font-semibold text-[#2C3E50] mb-3">Severity Levels</h4>
        <div className="space-y-2">
          {['Critical', 'High', 'Medium', 'Low'].map((level) => (
            <div key={level} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getSeverityColor(level.toLowerCase())}`}></div>
              <span className="text-sm text-[#546E7A]">{level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}