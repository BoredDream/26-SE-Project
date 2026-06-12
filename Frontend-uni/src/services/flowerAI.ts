// Qwen Vision API — 花卉识别服务
// API Key 从 .env.local 读取，参考 .env.example

const API_KEY = import.meta.env.VITE_QWEN_API_KEY as string
const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

export const FLOWER_LIST = [
  '樱花', '梨花', '梅花', '桃花', '玉兰花', '油菜花',
  '格桑花', '大金鸡菊', '蔷薇花', '紫藤花', '杜鹃花', '夹竹桃',
]

/** 将本地临时路径转成 base64 data URL */
async function pathToDataUrl(path: string): Promise<string> {
  if (typeof FileReader !== 'undefined') {
    // H5：用 fetch + FileReader 读取 blob
    const res = await fetch(path)
    const blob = await res.blob()
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } else {
    // 小程序：用 FileSystemManager 同步读取 base64
    const fs = uni.getFileSystemManager()
    const base64 = fs.readFileSync(path, 'base64') as string
    const mime = path.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
    return `data:${mime};base64,${base64}`
  }
}

/** POST 请求封装（兼容 H5 和小程序） */
function post(url: string, headers: Record<string, string>, body: object): Promise<any> {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: 'POST',
      header: headers,
      data: body,
      success: (res) => resolve(res.data),
      fail: reject,
    })
  })
}

/**
 * 识别图片中的花卉，返回 FLOWER_LIST 中的花名，或 null（无法识别）
 */
export async function identifyFlower(imagePath: string): Promise<string | null> {
  const dataUrl = await pathToDataUrl(imagePath)

  const data = await post(
    API_URL,
    {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    {
      model: 'qwen-vl-plus',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataUrl } },
            {
              type: 'text',
              text: `请识别这张图片中的花卉。从以下列表中选出最匹配的名称：${FLOWER_LIST.join('、')}。只回答一个花卉名称（例如"樱花"），如果图中没有花卉或不在列表中，回答"无法识别"。`,
            },
          ],
        },
      ],
    },
  )

  if (data?.error) {
    throw new Error(`Qwen API error [${data.error.code}]: ${data.error.message}`)
  }

  const rawContent = data?.choices?.[0]?.message?.content
  const text: string = Array.isArray(rawContent)
    ? rawContent.map((c: any) => c.text ?? '').join('')
    : (typeof rawContent === 'string' ? rawContent.trim() : '')

  console.log('[flowerAI] API 返回:', text || '(空)')

  return FLOWER_LIST.find((name) => text.includes(name)) ?? null
}
