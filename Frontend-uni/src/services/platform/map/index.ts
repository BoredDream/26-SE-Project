export interface Marker {
  id: string | number
  latitude: number
  longitude: number
  title: string
  species?: string
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
// #endif
// #ifdef MP-WEIXIN
import { createMpAdapter } from './map.mp'
// #endif

// 条件编译保证每个平台只保留一个分支赋值
let createMapAdapter: () => MapAdapter
// #ifdef H5
createMapAdapter = createH5Adapter
// #endif
// #ifdef MP-WEIXIN
createMapAdapter = createMpAdapter
// #endif

export { createMapAdapter }
