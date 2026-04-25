import type { MapAdapter, Marker } from './index'

export function createH5Adapter(): MapAdapter {
  let map: any = null
  let AMap: any = null
  let markerInstances: any[] = []

  return {
    async init(container, opts) {
      const loader = await import('@amap/amap-jsapi-loader')
      AMap = await loader.default.load({
        key: 'f3ebc39f2c1ffa41660503eff25b13d1',
        version: '2.0',
      })
      map = new AMap.Map(container, {
        zoom: opts.zoom,
        center: opts.center,
      })
    },
    setMarkers(markers) {
      if (!map || !AMap) return
      this.clearMarkers()
      markers.forEach(m => {
        const marker = new AMap.Marker({
          position: [m.longitude, m.latitude],
          title: m.title,
        })
        marker.setMap(map)
        markerInstances.push(marker)
      })
    },
    clearMarkers() {
      if (!map || !AMap) return
      markerInstances.forEach(m => m.setMap(null))
      markerInstances = []
    },
    setCenter(lat, lng) {
      if (map) map.setCenter([lng, lat])
    },
    setZoom(zoom) {
      if (map) map.setZoom(zoom)
    },
    destroy() {
      if (map) {
        map.destroy()
        map = null
      }
      AMap = null
      markerInstances = []
    },
  }
}
