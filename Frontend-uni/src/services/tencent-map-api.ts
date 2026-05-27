// 腾讯地图 REST API 服务（小程序 + H5 兼容）
// Key 从 .env.local 读取：VITE_TENCENT_MAP_KEY

const KEY = import.meta.env.VITE_TENCENT_MAP_KEY as string
const BASE = 'https://apis.map.qq.com/ws'

/** 通用 GET 请求，自动注入 key 和 output=json，status≠0 时 throw */
function get(path: string, params: Record<string, string | number>): Promise<any> {
  const qs = Object.entries({ ...params, key: KEY, output: 'json' })
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE}${path}?${qs}`,
      method: 'GET',
      success: (res) => {
        const d = res.data as any
        if (d?.status !== 0) {
          reject(new Error(d?.message || `腾讯地图 API 错误 status=${d?.status}`))
        } else {
          resolve(d)
        }
      },
      fail: (err) => reject(new Error(JSON.stringify(err))),
    })
  })
}

// ─── 1. 坐标转换 ──────────────────────────────────────────────────────────────

/**
 * WGS84（原始 GPS）→ GCJ02（微信地图/腾讯地图坐标系）
 * 用于将野外记录的 GPS 坐标转为地图可用坐标
 */
export async function convertCoord(
  lat: number,
  lng: number,
): Promise<{ lat: number; lng: number }> {
  const d = await get('/coord/v1/translate', { locations: `${lat},${lng}`, type: 1 })
  return d.locations[0] as { lat: number; lng: number }
}

// ─── 2. 地点搜索 ──────────────────────────────────────────────────────────────

export interface TencentPlace {
  id: string
  title: string
  address: string
  lat: number
  lng: number
}

/**
 * 关键词搜索地点，以狮山校区为中心 5km 范围
 * 本地结果为空时作为补充搜索源
 */
export async function searchPlaces(keyword: string): Promise<TencentPlace[]> {
  const d = await get('/place/v1/search', {
    keyword,
    boundary: 'nearby(30.4685,114.3545,5000,1)',
  })
  return ((d.data as any[]) || []).map((p) => ({
    id: p.id,
    title: p.title,
    address: p.address,
    lat: p.location.lat,
    lng: p.location.lng,
  }))
}

// ─── 3. 逆地址解析 ────────────────────────────────────────────────────────────

/**
 * 坐标 → 地址字符串（精确到街道/门牌号）
 * 导航页显示用户当前位置
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const d = await get('/geocoder/v1/', { location: `${lat},${lng}` })
  return (d.result?.address as string) ?? ''
}

// ─── 4. 步行路线规划 ──────────────────────────────────────────────────────────

export interface WalkingRoute {
  points: Array<{ latitude: number; longitude: number }>
  distance: number  // 米
  duration: number  // 秒
}

/**
 * 规划两点间步行路线，返回 polyline 坐标数组、距离和时间
 * 腾讯地图 polyline 使用差分编码：前两位是真实坐标，后续存 Δ×1000000
 */
export async function walkingRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<WalkingRoute> {
  const d = await get('/direction/v1/walking/', {
    from: `${fromLat},${fromLng}`,
    to: `${toLat},${toLng}`,
  })
  const route = d.result.routes[0]
  const raw = [...(route.polyline as number[])]
  for (let i = 2; i < raw.length; i++) {
    raw[i] = raw[i - 2] + raw[i] / 1000000
  }
  const points: WalkingRoute['points'] = []
  for (let i = 0; i < raw.length; i += 2) {
    points.push({ latitude: raw[i], longitude: raw[i + 1] })
  }
  return { points, distance: route.distance, duration: route.duration }
}
