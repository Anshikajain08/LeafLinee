'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRole } from '@/hooks/useRole'

interface Complaint {
  id: string
  title: string
  description: string
  status: string
  severity: string
  created_at: string
  resolved_at: string | null
  reopen_count: number
  category: {
    name: string
    icon: string
  } | null
  images: string[]
}

export default function MyReportsClient() {
  const { user } = useRole()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [feedbackRating, setFeedbackRating] = useState<number>(5)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  useEffect(() => {
    if (user) {
      fetchMyReports()
    }
  }, [user])

  const fetchMyReports = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          id,
          title,
          description,
          status,
          severity,
          created_at,
          resolved_at,
          reopen_count,
          images,
          category:categories(name, icon)
        `)
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reports:', error)
        return
      }

      setComplaints((data || []) as unknown as Complaint[])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReopen = async (complaintId: string) => {
    if (!confirm('Are you sure you want to reopen this issue?')) return

    try {
      // First get current reopen_count
      const { data: currentData } = await supabase
        .from('complaints')
        .select('reopen_count')
        .eq('id', complaintId)
        .single()

      const newCount = (currentData?.reopen_count || 0) + 1

      const { error } = await supabase
        .from('complaints')
        .update({
          status: 'open',
          reopen_count: newCount
        })
        .eq('id', complaintId)

      if (error) {
        console.error('Error reopening:', error)
        alert('Failed to reopen issue')
        return
      }

      alert('Issue reopened successfully')
      fetchMyReports()
    } catch (error) {
      console.error('Reopen error:', error)
    }
  }

  const handleSubmitFeedback = async (complaintId: string) => {
    if (!user) return

    setSubmittingFeedback(true)

    try {
      // Insert review/feedback
      const { error } = await supabase
        .from('reviews')
        .insert({
          complaint_id: complaintId,
          user_id: user.id,
          rating: feedbackRating,
          comment: feedbackComment
        })

      if (error) {
        console.error('Feedback error:', error)
        alert('Failed to submit feedback')
        return
      }

      alert('Thank you for your feedback!')
      setSelectedComplaint(null)
      setFeedbackRating(5)
      setFeedbackComment('')
    } catch (error) {
      console.error('Feedback error:', error)
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white'
      case 'high': return 'bg-orange-600 text-white'
      case 'medium': return 'bg-yellow-600 text-white'
      case 'low': return 'bg-green-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBD4]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00DF81] mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading your reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBD4] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#032221] mb-8">My Reports</h1>

        {complaints.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">You haven't submitted any reports yet</p>
            <a
              href="/citizen-app/report"
              className="inline-block px-6 py-3 bg-[#00DF81] text-[#032221] font-medium rounded-lg hover:bg-[#00c972] transition-colors"
            >
              Submit Your First Report
            </a>
          </div>
        ) : (
          <div className="grid gap-6">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSeverityColor(complaint.severity)}`}>
                        {complaint.severity}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                      {complaint.reopen_count > 0 && (
                        <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                          Reopened {complaint.reopen_count}x
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{complaint.title}</h3>
                    {complaint.category && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span>{complaint.category.icon}</span>
                        <span>{complaint.category.name}</span>
                      </div>
                    )}
                    <p className="text-gray-700 mb-2">{complaint.description}</p>
                    <div className="text-sm text-gray-500">
                      Reported: {new Date(complaint.created_at).toLocaleDateString()}
                      {complaint.resolved_at && (
                        <span className="ml-4">
                          Resolved: {new Date(complaint.resolved_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Images */}
                  {complaint.images && complaint.images.length > 0 && (
                    <div className="flex gap-2 ml-4">
                      {complaint.images.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Evidence ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                      {complaint.images.length > 3 && (
                        <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-600">
                          +{complaint.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {complaint.status === 'resolved' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="px-4 py-2 bg-[#00DF81] text-[#032221] font-medium rounded-lg hover:bg-[#00c972] transition-colors"
                      >
                        Rate Resolution
                      </button>
                      <button
                        onClick={() => handleReopen(complaint.id)}
                        className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Reopen Issue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Feedback Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Resolution</h2>
              <p className="text-gray-600 mb-6">How satisfied are you with how this issue was resolved?</p>

              {/* Rating Slider */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating: {feedbackRating}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00DF81]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00DF81] focus:border-transparent"
                  placeholder="Any additional feedback..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedComplaint(null)
                    setFeedbackRating(5)
                    setFeedbackComment('')
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitFeedback(selectedComplaint.id)}
                  disabled={submittingFeedback}
                  className="flex-1 px-6 py-3 bg-[#00DF81] text-[#032221] font-medium rounded-lg hover:bg-[#00c972] transition-colors disabled:opacity-50"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
