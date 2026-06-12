// localtion.txt 的 DMS 坐标（手机 GPS 采集 = WGS-84）转换为 GCJ-02
// 输出可直接粘贴回 mockData.ts 的 latitude / longitude 字段
// 用法：node scripts/convert-to-gcj02.mjs

function dmsToDecimal(d, m, s) {
  return d + m / 60 + s / 3600
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

function wgs84ToGcj02(lat, lng) {
  const a = 6378245.0, ee = 0.00669342162296594323
  const dLat = transformLat(lng - 105.0, lat - 35.0)
  const dLng = transformLng(lng - 105.0, lat - 35.0)
  const radLat = lat / 180.0 * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  const sq = Math.sqrt(magic)
  return {
    lat: lat + (dLat * 180.0) / ((a * (1 - ee)) / (magic * sq) * Math.PI),
    lng: lng + (dLng * 180.0) / (a / sq * Math.cos(radLat) * Math.PI),
  }
}

const locations = [
  { id: 1,  species: '樱花',     desc: '樱花路',                lat: [30,28,25], lng: [114,21,34] },
  { id: 2,  species: '蔷薇',     desc: '机电中心旁',            lat: [30,28,10], lng: [114,21,27] },
  { id: 3,  species: '蔷薇',     desc: '三运球场南',            lat: [30,28,24], lng: [114,21,35] },
  { id: 4,  species: '夹竹桃',   desc: '水产学院旁',            lat: [30,27,59], lng: [114,21,28] },
  { id: 5,  species: '夹竹桃',   desc: '水杉林西',              lat: [30,28, 3], lng: [114,21,10] },
  { id: 6,  species: '油菜花',   desc: '实验田',                lat: [30,28, 8], lng: [114,21,23] },
  { id: 7,  species: '莲花',     desc: '水杉林池塘',            lat: [30,28, 8], lng: [114,20,29] },
  { id: 8,  species: '莲花',     desc: '蕙芷园南池',            lat: [30,28,16], lng: [114,20,18] },
  { id: 9,  species: '梨花',     desc: '三教A座前',             lat: [30,28,28], lng: [114,21,13] },
  { id: 10, species: '玉兰',     desc: '图书馆前',              lat: [30,28,25], lng: [114,21, 7] },
  { id: 11, species: '大金鸡菊', desc: '狮子山广场南',          lat: [30,28,31], lng: [114,21, 8] },
  { id: 12, species: '格桑花',   desc: '蕙芷园北',              lat: [30,28,25], lng: [114,20,22] },
]

console.log('id | 花种·描述           | WGS-84 (lat, lng)      | GCJ-02 (lat, lng)      | Δ(m) lat,lng')
console.log('---|---------------------|------------------------|------------------------|----------------')

for (const loc of locations) {
  const wLat = dmsToDecimal(...loc.lat)
  const wLng = dmsToDecimal(...loc.lng)
  const { lat: gLat, lng: gLng } = wgs84ToGcj02(wLat, wLng)
  // 简单地表距离估算（1° lat ≈ 111000m，1° lng ≈ 111000*cos(lat) m）
  const dLatM = (gLat - wLat) * 111000
  const dLngM = (gLng - wLng) * 111000 * Math.cos(wLat * Math.PI / 180)
  const head = `${String(loc.id).padStart(2)} | ${loc.species}·${loc.desc}`.padEnd(23)
  const w = `(${wLat.toFixed(6)}, ${wLng.toFixed(6)})`.padEnd(24)
  const g = `(${gLat.toFixed(6)}, ${gLng.toFixed(6)})`.padEnd(24)
  console.log(`${head} | ${w} | ${g} | (${dLatM.toFixed(0)}m, ${dLngM.toFixed(0)}m)`)
}
