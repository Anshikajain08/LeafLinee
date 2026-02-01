declare module '*.css' {
  const content: any
  export default content
}

declare module 'leaflet.markercluster' {
  import * as L from 'leaflet'
  
  export interface MarkerClusterGroupOptions extends L.LayerOptions {
    showCoverageOnHover?: boolean
    zoomToBoundsOnClick?: boolean
    spiderfyOnMaxZoom?: boolean
    removeOutsideVisibleBounds?: boolean
    animate?: boolean
    animateAddingMarkers?: boolean
    disableClusteringAtZoom?: number
    maxClusterRadius?: number | ((zoom: number) => number)
    polygonOptions?: L.PolylineOptions
    singleMarkerMode?: boolean
    spiderLegPolylineOptions?: L.PolylineOptions
    spiderfyDistanceMultiplier?: number
    iconCreateFunction?: (cluster: L.MarkerCluster) => L.Icon | L.DivIcon
    clusterPane?: string
  }

  namespace L {
    interface MarkerCluster extends Marker {
      getAllChildMarkers(): Marker[]
      getChildCount(): number
    }

    interface MarkerClusterGroup extends FeatureGroup {
      addLayer(layer: Layer): this
      removeLayer(layer: Layer): this
      clearLayers(): this
      getVisibleParent(marker: Marker): Marker | MarkerCluster
    }

    function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup
  }
}
