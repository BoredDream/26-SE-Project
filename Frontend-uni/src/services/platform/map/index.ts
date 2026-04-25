export interface Marker {
  id: string | number
  latitude: number
  longitude: number
  title: string
}

export interface MapAdapter {
  init(container: any, opts: { center: [number, number]; zoom: number }): Promise<void>
  setMarkers(markers: Marker[]): void
  clearMarkers(): void
  setCenter(lat: number, lng: number): void
  setZoom(zoom: number): void
  destroy(): void
}

// #ifdef H5
import { createH5Adapter } from './map.h5'
export const createMapAdapter: () => MapAdapter = createH5Adapter
// #endif

// #ifdef MP-WEIXIN
import { createMpAdapter } from './map.mp'
export const createMapAdapter: () => MapAdapter = createMpAdapter
// #endif
