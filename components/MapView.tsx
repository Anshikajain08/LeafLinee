'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface Complaint {
  id: string
  category: string
  description: string
  location: string
  coordinates: [number, number]
  status: 'Pending' | 'In Progress' | 'Resolved'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  reportedBy: string
  reportedDate: string
  assignedTo: string
  images: number
  updates: number
  resolvedDate?: string
}

interface MapViewProps {
  complaints: Complaint[]
  selectedComplaint: Complaint | null
  onComplaintSelect: (c: Complaint | null) => void
}

const STATUS_COLOR: Record<string, string> = {
  Pending: '#ef4444',
  'In Progress': '#f59e0b',
  Resolved: '#22c55e'
}

export default function MapView({
  complaints,
  selectedComplaint,
  onComplaintSelect
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const markers = useRef<L.CircleMarker[]>([])

  /* ---------- INIT MAP ---------- */
  useEffect(() => {
    if (!mapRef.current || map.current) return

    map.current = L.map(mapRef.current).setView([28.6139, 77.209], 11)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map.current)

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  /* ---------- UPDATE MARKERS ---------- */
  useEffect(() => {
    if (!map.current) return

    markers.current.forEach(m => m.remove())
    markers.current = []

    complaints.forEach(c => {
      const marker = L.circleMarker(c.coordinates, {
        radius: selectedComplaint?.id === c.id ? 12 : 8,
        fillColor: STATUS_COLOR[c.status],
        color: '#fff',
        weight: 2,
        fillOpacity: 0.85
      })
        .addTo(map.current!)
        .on('click', () => onComplaintSelect(c))

      markers.current.push(marker)
    })
  }, [complaints, selectedComplaint])

  /* ---------- FOCUS SELECTED ---------- */
  useEffect(() => {
    if (!map.current || !selectedComplaint) return
    map.current.setView(selectedComplaint.coordinates, 14, { animate: true })
  }, [selectedComplaint])

  /* ---------- DISABLE MAP WHEN MODAL OPEN ---------- */
  useEffect(() => {
    if (!map.current) return

    if (selectedComplaint) {
      map.current.dragging.disable()
      map.current.scrollWheelZoom.disable()
      map.current.doubleClickZoom.disable()
      map.current.boxZoom.disable()
      map.current.keyboard.disable()
      map.current.touchZoom.disable()
    } else {
      map.current.dragging.enable()
      map.current.scrollWheelZoom.enable()
      map.current.doubleClickZoom.enable()
      map.current.boxZoom.enable()
      map.current.keyboard.enable()
      map.current.touchZoom.enable()
    }
  }, [selectedComplaint])

  return (
    <div className="w-full h-full rounded-lg border border-gray-300">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
