'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
// @ts-ignore
import 'leaflet/dist/leaflet.css'
// @ts-ignore
import 'leaflet.markercluster/dist/MarkerCluster.css'
// @ts-ignore
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'

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
  }
}

interface MapComponentProps {
  complaints: Complaint[]
  onSelectComplaint: (complaint: Complaint) => void
}

export default function MapComponent({ complaints, onSelectComplaint }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.MarkerClusterGroup | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    // Initialize map
    const map = L.map(mapContainer.current).setView([28.6139, 77.2090], 11)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update markers when complaints change
  useEffect(() => {
    if (!mapRef.current || complaints.length === 0) return

    // Remove existing markers
    if (markersRef.current) {
      mapRef.current.removeLayer(markersRef.current)
    }

    // Create marker cluster group
    const markers = L.markerClusterGroup({
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount()
        let className = 'marker-cluster-small'
        
        if (count >= 30) {
          className = 'marker-cluster-large'
        } else if (count >= 10) {
          className = 'marker-cluster-medium'
        }

        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: L.point(40, 40)
        })
      },
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    })

    // Add markers for each complaint
    complaints.forEach(complaint => {
      const severityColor = getSeverityColor(complaint.severity)
      
      const icon = L.divIcon({
        html: `<div style="background-color: ${severityColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
        className: 'custom-marker',
        iconSize: L.point(20, 20),
        iconAnchor: L.point(10, 10)
      })

      const marker = L.marker([complaint.location_lat, complaint.location_long], { icon })
      
      marker.on('click', () => {
        onSelectComplaint(complaint)
      })

      markers.addLayer(marker)
    })

    mapRef.current.addLayer(markers)
    markersRef.current = markers
  }, [complaints, onSelectComplaint])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF0000'
      case 'high': return '#FF6B00'
      case 'medium': return '#FFA500'
      case 'low': return '#00DF81'
      default: return '#829c86'
    }
  }

  return (
    <>
      <div ref={mapContainer} className="w-full h-full" />
      <style jsx global>{`
        .marker-cluster-small {
          background-color: rgba(253, 251, 212, 0.8);
        }
        .marker-cluster-small div {
          background-color: rgba(130, 156, 134, 0.8);
        }
        .marker-cluster-medium {
          background-color: rgba(130, 156, 134, 0.8);
        }
        .marker-cluster-medium div {
          background-color: rgba(3, 34, 33, 0.8);
        }
        .marker-cluster-large {
          background-color: rgba(3, 34, 33, 0.8);
        }
        .marker-cluster-large div {
          background-color: rgba(0, 223, 129, 0.8);
        }
        .marker-cluster {
          border-radius: 50%;
          text-align: center;
          font-weight: bold;
          border: 2px solid #00DF81;
        }
        .marker-cluster div {
          width: 30px;
          height: 30px;
          margin-left: 5px;
          margin-top: 5px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-cluster span {
          color: white;
          font-size: 12px;
        }
        .custom-marker {
          background: none;
          border: none;
        }
      `}</style>
    </>
  )
}
