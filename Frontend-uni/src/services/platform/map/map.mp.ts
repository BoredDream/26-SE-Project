import type { MapAdapter, Marker } from './index'

export function createMpAdapter(): MapAdapter {
  let mapContext: any = null
  let currentMarkers: Marker[] = []

  return {
    async init(container, opts) {
      // 小程序端 mapContext 通过 uni.createMapContext 创建
      // container 应为 map 组件的 id
      mapContext = uni.createMapContext(String(container))
    },
    setMarkers(markers) {
      currentMarkers = markers
      // 小程序端 markers 通过 <map> 组件的 :markers 属性绑定
      // 此处仅缓存，由页面组件读取后绑定到模板
    },
    clearMarkers() {
      currentMarkers = []
    },
    setCenter(lat, lng) {
      if (mapContext) {
        mapContext.moveToLocation({ latitude: lat, longitude: lng })
      }
    },
    setZoom(zoom) {
      // 小程序 <map> 的 scale 属性需由页面组件响应式更新
    },
    destroy() {
      mapContext = null
      currentMarkers = []
    },
  }
}
