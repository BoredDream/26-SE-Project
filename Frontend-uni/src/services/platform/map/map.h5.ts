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

      const SPECIES_EMOJI: Record<string, string> = {
        '樱花': '🌸',
        '向日葵': '🌻',
        '莲花': '🪷',
      }

      const makeIconUrl = (species?: string) => {
        const emoji = (species && SPECIES_EMOJI[species]) || '🌺'
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48"><ellipse cx="20" cy="46" rx="5" ry="2.5" fill="rgba(0,0,0,0.10)"/><circle cx="20" cy="20" r="18" fill="#faf8f5" stroke="#3a5a40" stroke-width="1.5"/><polygon points="15,34 25,34 20,44" fill="#faf8f5" stroke="#3a5a40" stroke-width="1.5" stroke-linejoin="round"/><text x="20" y="27" font-size="20" text-anchor="middle">${emoji}</text></svg>`
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
      }

      markers.forEach(m => {
        const icon = new AMap.Icon({
          size: new AMap.Size(40, 48),
          image: makeIconUrl(m.species),
          imageSize: new AMap.Size(40, 48),
        })
        const marker = new AMap.Marker({
          position: [m.longitude, m.latitude],
          title: m.title,
          icon,
          anchor: 'bottom-center',
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
