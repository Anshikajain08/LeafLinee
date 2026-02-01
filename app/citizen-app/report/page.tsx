'use client'

import { useState, useEffect, ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { useRole } from '@/hooks/useRole'

interface Category {
  id: string
  name: string
  icon: string
}

type Step = 1 | 2 | 3

// Dynamically import map to avoid SSR issues
const ReportMapComponent = dynamic<{
  location: { lat: number; lng: number } | null
  onLocationSelect: (lat: number, lng: number) => void
  // @ts-ignore
}>(() => import('./ReportMapComponent').then(mod => mod.default), { ssr: false }) as ComponentType<{
  location: { lat: number; lng: number } | null
  onLocationSelect: (lat: number, lng: number) => void
}>

export default function ReportPage() {
  const router = useRouter()
  const { user } = useRole()

  // Form state
  const [step, setStep] = useState<Step>(1)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [digipin, setDigipin] = useState<string>('')
  const [photos, setPhotos] = useState<File[]>([])
  const [description, setDescription] = useState('')
  const [title, setTitle] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [isRecording, setIsRecording] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [duplicateCheck, setDuplicateCheck] = useState<any>(null)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        console.log('Fetching categories from database...')
        setCategoriesLoading(true)
        setCategoriesError(null)
        
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, icon')
          .order('name')

        if (error) {
          console.error('Error fetching categories:', error)
          setCategoriesError(`Failed to load categories: ${error.message}`)
          
          // Check if table doesn't exist
          if (error.code === '42P01') {
            setCategoriesError('Categories table does not exist. Please run the database setup.')
          }
          return
        }

        if (!data || data.length === 0) {
          console.warn('No categories found in database')
          setCategoriesError('No categories available. Please add categories to the database.')
          setCategories([])
        } else {
          console.log(`Loaded ${data.length} categories:`, data)
          setCategories(data)
        }
      } catch (error) {
        console.error('Exception fetching categories:', error)
        setCategoriesError('An unexpected error occurred while loading categories')
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Get GPS location
  const handleGetGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLocation({ lat, lng })
          setDigipin(`DL-${Math.floor(lat * 1000)}-${Math.floor(lng * 1000)}`)
        },
        (error) => {
          alert('Unable to get GPS location: ' + error.message)
        }
      )
    } else {
      alert('Geolocation is not supported by your browser')
    }
  }

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    setLocation({ lat, lng })
    setDigipin(`DL-${Math.floor(lat * 1000)}-${Math.floor(lng * 1000)}`)
  }

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (photos.length + newFiles.length > 5) {
        alert('Maximum 5 photos allowed')
        e.target.value = '' // Reset input
        return
      }
      setPhotos([...photos, ...newFiles])
      e.target.value = '' // Reset input to allow same file again
    }
  }

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  // Voice to text
  const handleVoiceToText = () => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    try {
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsRecording(true)
        console.log('Speech recognition started')
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setDescription(prev => prev ? prev + ' ' + transcript : transcript)
        setIsRecording(false)
        console.log('Transcript:', transcript)
      }

      recognition.onerror = (event: any) => {
        setIsRecording(false)
        console.error('Speech recognition error:', event.error)
        alert(`Speech recognition error: ${event.error}. Please try again.`)
      }

      recognition.onend = () => {
        setIsRecording(false)
        console.log('Speech recognition ended')
      }

      recognition.start()
    } catch (error) {
      setIsRecording(false)
      console.error('Error starting speech recognition:', error)
      alert('Failed to start speech recognition. Please try again.')
    }
  }

  // Check for duplicates
  const checkDuplicates = async () => {
    if (!location) return

    try {
      const { data, error } = await supabase
        .rpc('check_for_duplicate_report', {
          lat: location.lat,
          lng: location.lng,
          report_title: title,
          category_id: selectedCategory
        })

      if (error) {
        console.error('Duplicate check error:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error checking duplicates:', error)
      return null
    }
  }

  // Submit report
  const handleSubmit = async () => {
    // Validate required fields
    if (!location) {
      alert('Please select a location')
      return
    }
    
    if (!title || !title.trim()) {
      alert('Please enter a title')
      return
    }
    
    if (!description || !description.trim()) {
      alert('Please enter a description')
      return
    }
    
    if (!selectedCategory) {
      alert('Please select a category')
      return
    }

    // Check if user is logged in (skip in dev mode)
    if (!user) {
      alert('Please log in to submit a report')
      return
    }

    setIsSubmitting(true)

    try {
      console.log('Submitting report...')
      
      // Check for duplicates (skip if RPC doesn't exist)
      try {
        const duplicate = await checkDuplicates()
        
        if (duplicate && duplicate.length > 0) {
          setDuplicateCheck(duplicate[0])
          setIsSubmitting(false)
          return
        }
      } catch (dupError) {
        console.warn('Duplicate check failed, continuing with submission:', dupError)
        // Continue with submission even if duplicate check fails
      }

      // Upload photos
      const photoUrls: string[] = []
      if (photos.length > 0) {
        console.log(`Uploading ${photos.length} photos...`)
        for (const photo of photos) {
          try {
            const fileName = `${user.id}/${Date.now()}_${photo.name}`
            const { data, error } = await supabase.storage
              .from('complaint-images')
              .upload(fileName, photo)

            if (error) {
              console.error('Photo upload error:', error)
              // Continue even if one photo fails
              continue
            }

            const { data: urlData } = supabase.storage
              .from('complaint-images')
              .getPublicUrl(fileName)

            photoUrls.push(urlData.publicUrl)
            console.log('Photo uploaded:', urlData.publicUrl)
          } catch (photoError) {
            console.error('Error uploading photo:', photoError)
          }
        }
      }

      // Create complaint
      console.log('Creating complaint record...')
      const { error: insertError } = await supabase
        .from('complaints')
        .insert({
          reporter_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category_id: selectedCategory,
          severity,
          location_lat: location.lat,
          location_long: location.lng,
          digipin,
          images: photoUrls,
          status: 'open'
        })

      if (insertError) {
        console.error('Error creating complaint:', insertError)
        alert(`Failed to submit report: ${insertError.message}`)
        return
      }

      console.log('Report submitted successfully!')
      alert('Report submitted successfully!')
      router.push('/citizen-app/my-reports')
    } catch (error) {
      console.error('Submission error:', error)
      alert(`An error occurred while submitting: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle upvote existing
  const handleUpvoteExisting = async () => {
    if (!duplicateCheck || !user) return

    try {
      // Add upvote logic here
      const { error } = await supabase
        .from('complaint_votes')
        .insert({
          complaint_id: duplicateCheck.id,
          user_id: user.id
        })

      if (error && error.code !== '23505') { // Ignore duplicate key error
        console.error('Upvote error:', error)
        alert('Failed to upvote')
        return
      }

      alert('Upvoted existing report!')
      router.push('/citizen-app/dashboard')
    } catch (error) {
      console.error('Upvote error:', error)
    }
  }

  // Render duplicate prompt
  if (duplicateCheck) {
    return (
      <div className="min-h-screen bg-[#FDFBD4] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Similar Report Found
          </h2>
          <p className="text-gray-700 mb-6">
            A similar issue has already been reported in this area. Would you like to upvote the existing report instead?
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{duplicateCheck.title}</h3>
            <p className="text-sm text-gray-600">{duplicateCheck.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              Reported: {new Date(duplicateCheck.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleUpvoteExisting}
              className="flex-1 px-6 py-3 bg-[#00DF81] text-[#032221] font-medium rounded-lg hover:bg-[#00c972] transition-colors"
            >
              Upvote Existing Report
            </button>
            <button
              onClick={() => setDuplicateCheck(null)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Submit New Report Anyway
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBD4] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-[#00DF81] text-[#032221]' : 'bg-gray-300 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-[#00DF81]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm font-medium text-gray-700">Location</span>
            <span className="text-sm font-medium text-gray-700">Evidence</span>
            <span className="text-sm font-medium text-gray-700">Details</span>
          </div>
        </div>

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Location</h2>
            
            <button
              onClick={handleGetGPS}
              className="mb-4 w-full px-6 py-3 bg-[#00DF81] text-[#032221] font-medium rounded-lg hover:bg-[#00c972] transition-colors"
            >
              📍 Use My Current Location
            </button>

            <ReportMapComponent 
              location={location}
              onLocationSelect={handleMapClick}
            />

            {location && (
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm text-gray-700">
                  <strong>DIGIPIN:</strong> {digipin}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </p>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!location}
              className="w-full px-6 py-3 bg-[#829c86] text-white font-medium rounded-lg hover:bg-[#6d8371] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Add Evidence
            </button>
          </div>
        )}

        {/* Step 2: Evidence */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Evidence</h2>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00DF81] focus:border-transparent"
                placeholder="Brief description of the issue"
              />
            </div>

            {/* Photo Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (Max 5) {photos.length > 0 && `- ${photos.length} selected`}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                disabled={photos.length >= 5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#00DF81] file:text-[#032221] hover:file:bg-[#00c972] disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {photos.length >= 5 && (
                <p className="text-sm text-orange-600 mt-1">Maximum limit reached. Remove a photo to add more.</p>
              )}
              {photos.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-20 object-cover rounded border-2 border-gray-200"
                      />
                      <button
                        onClick={() => removePhoto(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors shadow-lg"
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00DF81] focus:border-transparent"
                placeholder="Describe the issue in detail..."
              />
              <button
                onClick={handleVoiceToText}
                className={`mt-2 px-4 py-2 ${isRecording ? 'bg-red-500' : 'bg-[#829c86]'} text-white rounded-lg hover:opacity-90 transition-opacity`}
              >
                {isRecording ? '🎤 Recording...' : '🎤 Voice to Text'}
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!title || !description}
                className="flex-1 px-6 py-3 bg-[#829c86] text-white font-medium rounded-lg hover:bg-[#6d8371] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Category & Submit
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Category & Severity */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Categorize Issue</h2>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              
              {categoriesLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00DF81]"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading categories...</p>
                </div>
              ) : categoriesError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{categoriesError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Retry
                  </button>
                </div>
              ) : categories.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">No categories available. Please contact administrator.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedCategory === cat.id
                          ? 'border-[#00DF81] bg-[#00DF81]/10'
                          : 'border-gray-300 hover:border-[#829c86]'
                      }`}
                    >
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Severity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity *
              </label>
              <div className="grid grid-cols-4 gap-4">
                {(['low', 'medium', 'high', 'critical'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverity(sev)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      severity === sev
                        ? sev === 'critical' ? 'bg-red-600 text-white'
                          : sev === 'high' ? 'bg-orange-600 text-white'
                          : sev === 'medium' ? 'bg-yellow-600 text-white'
                          : 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedCategory || isSubmitting}
                className="flex-1 px-6 py-3 bg-[#00DF81] text-[#032221] font-medium rounded-lg hover:bg-[#00c972] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
