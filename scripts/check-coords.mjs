// 校园花卉点位坐标转换 + 反向地址验证脚本
// 1) 解析 localtion.txt 收录的 12 行 DMS（度°分′秒″）坐标 → 十进制
// 2) 原坐标是 WGS-84（手机 GPS 采集），可直接传给 Nominatim 反向地址解析
//    地图渲染所需的 GCJ-02 值由 scripts/convert-to-gcj02.mjs 生成
// 3) 输出对照表，人眼核对实际地址是否与 localtion.txt 文字描述吻合
// 用法：node scripts/check-coords.mjs

const BASE = 'https://nominatim.openstreetmap.org/reverse'

// ─── DMS → 十进制 ────────────────────────────────────────────────────────────
function dmsToDecimal(d, m, s) {
  return +(d + m / 60 + s / 3600).toFixed(6)
}

// ─── GCJ-02（高德/腾讯/微信坐标系）→ WGS-84（GPS 原始坐标，Nominatim 所需）──
function gcj02ToWgs84(lat, lng) {
  const a = 6378245.0, ee = 0.00669342162296594323
  const dLat = transformLat(lng - 105.0, lat - 35.0)
  const dLng = transformLng(lng - 105.0, lat - 35.0)
  const radLat = lat / 180.0 * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  const sq = Math.sqrt(magic)
  return {
    lat: lat - (dLat * 180.0) / ((a * (1 - ee)) / (magic * sq) * Math.PI),
    lng: lng - (dLng * 180.0) / (a / sq * Math.cos(radLat) * Math.PI),
  }
}
function transformLat(x, y) {
  let r = -100 + 2*x + 3*y + 0.2*y*y + 0.1*x*y + 0.2*Math.sqrt(Math.abs(x))
  r += (20*Math.sin(6*x*Math.PI) + 20*Math.sin(2*x*Math.PI)) * 2/3
  r += (20*Math.sin(y*Math.PI) + 40*Math.sin(y/3*Math.PI)) * 2/3
  r += (160*Math.sin(y/12*Math.PI) + 320*Math.sin(y/30*Math.PI)) * 2/3
  return r
}
function transformLng(x, y) {
  let r = 300 + x + 2*y + 0.1*x*x + 0.1*x*y + 0.1*Math.sqrt(Math.abs(x))
  r += (20*Math.sin(6*x*Math.PI) + 20*Math.sin(2*x*Math.PI)) * 2/3
  r += (20*Math.sin(x*Math.PI) + 40*Math.sin(x/3*Math.PI)) * 2/3
  r += (150*Math.sin(x/12*Math.PI) + 300*Math.sin(x/30*Math.PI)) * 2/3
  return r
}

// ─── localtion.txt 原文 12 条 ────────────────────────────────────────────────
//   原文 "荚竹" 系 "夹竹桃" 笔误（按 static/flowers/夹竹桃.png 文件名对齐）
const locations = [
  { id: 1,  species: '樱花',     desc: '樱花路',                lat: [30,28,25], lng: [114,21,34] },
  { id: 2,  species: '蔷薇',     desc: '机电工程训练中心旁',     lat: [30,28,10], lng: [114,21,27] },
  { id: 3,  species: '蔷薇',     desc: '三运篮球场南侧',         lat: [30,28,24], lng: [114,21,35] },
  { id: 4,  species: '夹竹桃',   desc: '水产学院教学实习基地旁', lat: [30,27,59], lng: [114,21,28] },
  { id: 5,  species: '夹竹桃',   desc: '水杉林西侧100m',         lat: [30,28, 3], lng: [114,21,10] },
  { id: 6,  species: '油菜花',   desc: '水杉林周边实验田',       lat: [30,28, 8], lng: [114,21,23] },
  { id: 7,  species: '莲花',     desc: '水杉林西侧300m池塘',     lat: [30,28, 8], lng: [114,20,29] },
  { id: 8,  species: '莲花',     desc: '蕙芷园南面池塘',         lat: [30,28,16], lng: [114,20,18] },
  { id: 9,  species: '梨花',     desc: '三教A座前',              lat: [30,28,28], lng: [114,21,13] },
  { id: 10, species: '玉兰',     desc: '图书馆前',               lat: [30,28,25], lng: [114,21, 7] },
  { id: 11, species: '大金鸡菊', desc: '狮子山广场南面',         lat: [30,28,31], lng: [114,21, 8] },
  { id: 12, species: '格桑花',   desc: '蕙芷园北面',             lat: [30,28,25], lng: [114,20,22] },
]

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

console.log('id | 花种·描述                   | WGS-84 (lat, lng)      | Nominatim 解析地址')
console.log('---|----------------------------|------------------------|----------------------------')

for (const loc of locations) {
  const lat = dmsToDecimal(...loc.lat)
  const lng = dmsToDecimal(...loc.lng)
  const url = `${BASE}?lat=${lat}&lon=${lng}&format=json&accept-language=zh`
  let addr = '解析失败'
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'flower-map-dev/1.0' } })
    const d = await res.json()
    addr = d.display_name ?? '解析失败'
  } catch (e) {
    addr = `请求失败: ${e.message}`
  }
  const head = `${String(loc.id).padStart(2)} | ${loc.species}·${loc.desc}`.padEnd(32)
  const w84 = `(${lat}, ${lng})`.padEnd(24)
  console.log(`${head} | ${w84} | ${addr}`)
  await sleep(1100) // Nominatim 限速：≤1 req/s
}
