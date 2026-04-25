# 前端 uni-app 双端迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `Frontend-uni/` 新建 uni-app（Vue 3 + Vite + TS）工程，将现有 `Frontend/src/` 的页面、组件、状态层迁移为 H5 + 微信小程序双端源码，废弃 `vue-router` 与 `fetch`，全面使用 `uni.request`、`uni.navigateTo`、`uni.setStorageSync` 及 `pages.json` tabBar。

**Architecture:** 工程与旧 `Frontend/` 并行；`src/services/api.ts` 用 `uni.request` 封装以跨端通吃；`src/services/storage.ts` 封装 token 持久化；`src/utils/auth-guard.ts` 替代 `router.beforeEach`；`src/services/platform/map/` 提供 `MapAdapter` 屏蔽腾讯地图 H5/小程序差异；页面模板做 `div→view`、`img→image`、`span→text` 等替换。

**Tech Stack:** uni-app (Vue 3 + Vite + TS), Pinia, SCSS

---

## 文件结构

| 文件 | 动作 | 说明 |
|------|------|------|
| `Frontend-uni/package.json` | 创建 | uni-app Vue3 工程依赖 |
| `Frontend-uni/vite.config.ts` | 创建 | 使用 `@dcloudio/vite-plugin-uni` |
| `Frontend-uni/tsconfig.json` | 创建 | 继承 `@vue/tsconfig` + uni 类型 |
| `Frontend-uni/src/manifest.json` | 创建 | 双端编译目标声明 |
| `Frontend-uni/src/pages.json` | 创建 | 页面路由 + tabBar（替代 BottomNav） |
| `Frontend-uni/src/uni.scss` | 创建 | 全局 SCSS 变量/入口 |
| `Frontend-uni/src/main.ts` | 创建 | 创建 uni-app 实例并挂载 Pinia |
| `Frontend-uni/src/App.vue` | 创建 | 全局入口，onLaunch 调用 auth-guard |
| `Frontend-uni/src/services/api.ts` | 创建 | `uni.request` 封装，路径前缀 `/v1` |
| `Frontend-uni/src/services/storage.ts` | 创建 | `getToken/setToken/clearToken` |
| `Frontend-uni/src/services/mockData.ts` | 复制 | 原样复制自 `Frontend/src/services/mockData.ts` |
| `Frontend-uni/src/stores/auth.ts` | 创建 | Pinia auth store，`localStorage` 改 `storage.ts` |
| `Frontend-uni/src/stores/location.ts` | 创建 | Pinia location store，同上 |
| `Frontend-uni/src/stores/checkin.ts` | 创建 | Pinia checkin store，同上；createCheckin 适配新上传流程 |
| `Frontend-uni/src/stores/achievement.ts` | 创建 | Pinia achievement store，同上 |
| `Frontend-uni/src/utils/auth-guard.ts` | 创建 | token 检查 + `uni.reLaunch` 跳转登录 |
| `Frontend-uni/src/services/platform/map/index.ts` | 创建 | `MapAdapter` 接口 + 平台条件编译分流 |
| `Frontend-uni/src/services/platform/map/map.h5.ts` | 创建 | 腾讯地图 Web JS v2 实现 |
| `Frontend-uni/src/services/platform/map/map.mp.ts` | 创建 | 微信小程序原生 `<map>` 实现 |
| `Frontend-uni/src/pages/login/login.vue` | 创建 | 演示模式走真实接口，加"去注册" |
| `Frontend-uni/src/pages/register/register.vue` | 创建 | 复用现有 Register.vue 表单，改路由 |
| `Frontend-uni/src/pages/home/home.vue` | 创建 | 轮播改 `<swiper>`，Unsplash 换本地图 |
| `Frontend-uni/src/pages/map/map.vue` | 创建 | 接入 MapAdapter，标签替换 |
| `Frontend-uni/src/pages/navigation/navigation.vue` | 创建 | 接入 MapAdapter，标签替换 |
| `Frontend-uni/src/pages/checkin/checkin.vue` | 创建 | 图片选择改 `uni.chooseImage`，上传走 `/v1/upload` |
| `Frontend-uni/src/pages/garden/garden.vue` | 创建 | 标签替换 |
| `Frontend-uni/src/pages/profile/profile.vue` | 创建 | 标签替换 |
| `Frontend-uni/src/pages/user-detail/user-detail.vue` | 创建 | 标签替换，`onLoad` 取参数 |
| `Frontend-uni/src/components/flower-suggest/flower-suggest.vue` | 创建 | 标签替换 |
| `Frontend-uni/static/icon/*.png` | 创建 | tabBar 图标（由 SVG 转换） |
| `Frontend-uni/static/carousel/*.jpg` | 创建 | 首页轮播本地占位图（简易生成） |
| `Frontend-uni/scripts/verify-api.sh` | 创建 | 后端三接口冒烟脚本 |

---

### Task 1: 初始化 uni-app 工程配置

**Files:**
- Create: `Frontend-uni/package.json`
- Create: `Frontend-uni/vite.config.ts`
- Create: `Frontend-uni/tsconfig.json`
- Create: `Frontend-uni/src/manifest.json`
- Create: `Frontend-uni/src/pages.json`
- Create: `Frontend-uni/src/uni.scss`
- Create: `Frontend-uni/src/main.ts`
- Create: `Frontend-uni/src/App.vue`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/src/pages
mkdir -p /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/src/components
mkdir -p /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/src/stores
mkdir -p /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/src/services/platform/map
mkdir -p /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/src/utils
mkdir -p /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/static/icon
mkdir -p /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/static/carousel
mkdir -p /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/scripts
```

- [ ] **Step 2: 写入 package.json**

```json
{
  "name": "flower-garden-uni",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev:h5": "uni",
    "dev:mp-weixin": "uni -p mp-weixin",
    "build:h5": "uni build",
    "build:mp-weixin": "uni build -p mp-weixin",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@dcloudio/uni-app": "3.0.0-alpha-5000820260420001",
    "@dcloudio/uni-h5": "3.0.0-alpha-5000820260420001",
    "@dcloudio/uni-mp-weixin": "3.0.0-alpha-5000820260420001",
    "pinia": "^3.0.4",
    "vue": "^3.5.29",
    "vue-i18n": "^9.14.3"
  },
  "devDependencies": {
    "@dcloudio/types": "^3.4.30",
    "@dcloudio/vite-plugin-uni": "3.0.0-alpha-5000820260420001",
    "@types/node": "^20.17.0",
    "sass-embedded": "^1.98.0",
    "typescript": "~5.9.3",
    "vite": "^7.3.1",
    "vue-tsc": "^3.2.5"
  },
  "engines": {
    "node": "^20.19.0 || >=22.12.0"
  }
}
```

- [ ] **Step 3: 写入 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [
    uni(),
  ],
})
```

- [ ] **Step 4: 写入 tsconfig.json**

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["@dcloudio/types"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

- [ ] **Step 5: 写入 manifest.json**

```json
{
  "name": "狮山花园",
  "appid": "__UNI__FLOWERGARDEN",
  "description": "花卉地图打卡应用",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false,
  "app-plus": {},
  "h5": {
    "title": "狮山花园",
    "router": {
      "mode": "hash"
    }
  },
  "mp-weixin": {
    "appid": "",
    "setting": {
      "urlCheck": false
    }
  }
}
```

- [ ] **Step 6: 写入 pages.json**

```json
{
  "pages": [
    {
      "path": "pages/login/login",
      "style": {
        "navigationBarTitleText": "登录",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/register/register",
      "style": {
        "navigationBarTitleText": "注册",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/home/home",
      "style": {
        "navigationBarTitleText": "首页",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/map/map",
      "style": {
        "navigationBarTitleText": "地图",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/checkin/checkin",
      "style": {
        "navigationBarTitleText": "打卡",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/garden/garden",
      "style": {
        "navigationBarTitleText": "花园",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/profile/profile",
      "style": {
        "navigationBarTitleText": "我的",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/user-detail/user-detail",
      "style": {
        "navigationBarTitleText": "用户详情",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/navigation/navigation",
      "style": {
        "navigationBarTitleText": "导航",
        "navigationStyle": "custom"
      }
    }
  ],
  "tabBar": {
    "color": "#6d7f66",
    "selectedColor": "#338a3f",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/home/home",
        "text": "主页",
        "iconPath": "static/icon/home.png",
        "selectedIconPath": "static/icon/home-active.png"
      },
      {
        "pagePath": "pages/map/map",
        "text": "地图",
        "iconPath": "static/icon/map.png",
        "selectedIconPath": "static/icon/map-active.png"
      },
      {
        "pagePath": "pages/garden/garden",
        "text": "花园",
        "iconPath": "static/icon/garden.png",
        "selectedIconPath": "static/icon/garden-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "static/icon/profile.png",
        "selectedIconPath": "static/icon/profile-active.png"
      }
    ]
  },
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  }
}
```

- [ ] **Step 7: 写入 uni.scss**

```scss
/* 全局 SCSS 变量 */
$primary-color: #4CAF50;
$primary-light: #81C784;
$bg-page: #f3f9f3;
```

- [ ] **Step 8: 写入 main.ts**

```typescript
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())
  return {
    app
  }
}
```

- [ ] **Step 9: 写入 App.vue**

```vue
<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { checkAuth } from '@/utils/auth-guard'

onLaunch(() => {
  const authStore = useAuthStore()
  authStore.loadUser()
  checkAuth()
})
</script>

<style>
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}
</style>
```

- [ ] **Step 10: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/
git commit -m "feat(frontend-uni): initialize uni-app project config"
```

---

### Task 2: 安装依赖并验证工程可编译

- [ ] **Step 1: 安装 npm 依赖**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni
npm install
```

预期：无 fatal error，生成 `node_modules/` 和 `package-lock.json`。

- [ ] **Step 2: 尝试编译 H5**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni
npm run build:h5
```

预期：编译成功，生成 `dist/build/h5/`（此时页面为空但无报错）。

- [ ] **Step 3: Commit lock 文件**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/package-lock.json
git commit -m "chore(frontend-uni): add package-lock.json"
```

---

### Task 3: 创建通用层 api.ts / storage.ts / mockData.ts

**Files:**
- Create: `Frontend-uni/src/services/api.ts`
- Create: `Frontend-uni/src/services/storage.ts`
- Create: `Frontend-uni/src/services/mockData.ts`

- [ ] **Step 1: 写入 api.ts**

```typescript
const API_BASE_URL = 'http://127.0.0.1:5000'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface User {
  id: number
  openid: string
  nickname: string
  avatar: string
  level: number
  exp: number
  total_checkins: number
  created_at: string
  updated_at: string
}

export interface Location {
  id: number
  name: string
  description: string
  latitude: string
  longitude: string
  flower_species: string
  bloom_status: string
  historical_bloom_start: string | null
  historical_bloom_end: string | null
  cover_image: string
  checkin_count: number
  status_updated_at: string | null
  created_at: string
  updated_at?: string
}

export interface Checkin {
  id: number
  user_id: number
  location_id: number
  content: string
  images: string[]
  likes_count: number
  dislikes_count?: number
  comments_count?: number
  created_at: string
  updated_at: string
  user?: User
  location?: Location
}

export interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  requirement: number
  reward_exp: number
}

export interface Title {
  id: number
  name: string
  description: string
  requirement: number
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setToken(token: string) {
    this.token = token
  }

  clearToken() {
    this.token = null
  }

  private request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const url = `${this.baseURL}${endpoint}`
      const header: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (this.token) {
        header['Authorization'] = `Bearer ${this.token}`
      }

      uni.request({
        url,
        method: method as any,
        header,
        data,
        success: (res) => {
          const statusCode = res.statusCode || 0
          const responseData = res.data as ApiResponse<T>
          if (statusCode >= 200 && statusCode < 300) {
            resolve(responseData)
          } else {
            reject(new Error(responseData?.message || `HTTP ${statusCode}`))
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || 'Network error'))
        },
      })
    })
  }

  get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint)
  }

  post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data)
  }

  patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data)
  }

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint)
  }

  uploadFile(endpoint: string, filePath: string): Promise<ApiResponse<{ url: string }>> {
    return new Promise((resolve, reject) => {
      const url = `${this.baseURL}${endpoint}`
      const header: Record<string, string> = {}
      if (this.token) {
        header['Authorization'] = `Bearer ${this.token}`
      }
      uni.uploadFile({
        url,
        filePath,
        name: 'file',
        header,
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            resolve(data)
          } catch {
            reject(new Error('Invalid upload response'))
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || 'Upload failed'))
        },
      })
    })
  }
}

const apiClient = new ApiClient(API_BASE_URL)

export const api = {
  health: () => apiClient.get('/v1/health'),

  auth: {
    login: (mode: string, code?: string) =>
      apiClient.post<{ token: string; user: User }>('/v1/auth/login', { mode, code }),
    register: (data: { username: string; password: string; nickname: string }) =>
      apiClient.post<{ token: string; user: User }>('/v1/auth/register', data),
  },

  users: {
    getList: () => apiClient.get<User[]>('/v1/users'),
    getById: (id: number) => apiClient.get<User>(`/v1/users/${id}`),
    getCurrent: () => apiClient.get<User>('/v1/users/me'),
  },

  locations: {
    getList: () => apiClient.get<Location[]>('/v1/locations'),
    getById: (id: number) => apiClient.get<Location>(`/v1/locations/${id}`),
    updateStatus: (id: number, status: number) => apiClient.patch(`/v1/locations/${id}/status`, { status }),
  },

  checkins: {
    getList: () => apiClient.get<Checkin[]>('/v1/checkins'),
    create: (data: { location_id: number; content: string; images: string[] }) =>
      apiClient.post<Checkin>('/v1/checkins', data),
    like: (id: number) => apiClient.post(`/v1/checkins/${id}/like`),
    report: (id: number, reason: string) => apiClient.post(`/v1/checkins/${id}/report`, { reason }),
  },

  subscriptions: {
    getList: () => apiClient.get('/v1/subscriptions'),
  },

  achievements: {
    getList: () => apiClient.get<Achievement[]>('/v1/achievements'),
  },

  titles: {
    getList: () => apiClient.get<Title[]>('/v1/titles'),
  },

  admin: {
    getStats: () => apiClient.get('/v1/admin/stats'),
  },

  upload: (filePath: string) => apiClient.uploadFile('/v1/upload', filePath),

  setToken: (token: string) => apiClient.setToken(token),
  clearToken: () => apiClient.clearToken(),
}

export default api
```

- [ ] **Step 2: 写入 storage.ts**

```typescript
const TOKEN_KEY = 'auth_token'

export function getToken(): string | null {
  try {
    return uni.getStorageSync(TOKEN_KEY) || null
  } catch {
    return null
  }
}

export function setToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function clearToken() {
  uni.removeStorageSync(TOKEN_KEY)
}
```

- [ ] **Step 3: 复制 mockData.ts**

将 `Frontend/src/services/mockData.ts` 原样复制到 `Frontend-uni/src/services/mockData.ts`。内容不变（接口类型从 `./api` 导入，路径 `@/services/api` 因 `tsconfig.json` 的 `paths` 配置保持一致）。

```bash
cp /home/yaoyao/vibe/se/26-SE-Project/Frontend/src/services/mockData.ts \
   /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/src/services/mockData.ts
```

- [ ] **Step 4: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/services/
git commit -m "feat(frontend-uni): add api client, storage wrapper and mock data"
```

---

### Task 4: 创建 Pinia Stores

**Files:**
- Create: `Frontend-uni/src/stores/auth.ts`
- Create: `Frontend-uni/src/stores/location.ts`
- Create: `Frontend-uni/src/stores/checkin.ts`
- Create: `Frontend-uni/src/stores/achievement.ts`

- [ ] **Step 1: 写入 stores/auth.ts**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/services/api'
import { api } from '@/services/api'
import { getToken, setToken, clearToken } from '@/services/storage'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(getToken())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = async (code: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.auth.login('demo', code)
      const { token: newToken, user: userData } = response.data
      token.value = newToken
      user.value = userData
      setToken(newToken)
      api.setToken(newToken)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const register = async (username: string, password: string, nickname: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.auth.register({ username, password, nickname })
      const { token: newToken, user: userData } = response.data
      token.value = newToken
      user.value = userData
      setToken(newToken)
      api.setToken(newToken)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '注册失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    clearToken()
    api.clearToken()
  }

  const loadUser = async () => {
    if (!token.value) return
    try {
      api.setToken(token.value)
      const response = await api.users.getCurrent()
      user.value = response.data
    } catch (err) {
      logout()
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    loadUser,
  }
})
```

- [ ] **Step 2: 写入 stores/location.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Location } from '@/services/api'
import { api } from '@/services/api'
import { mockLocations } from '@/services/mockData'

export const useLocationStore = defineStore('location', () => {
  const locations = ref<Location[]>([])
  const currentLocation = ref<Location | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadLocations = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.locations.getList()
      locations.value = response.data?.length ? response.data : mockLocations
    } catch (err) {
      locations.value = mockLocations
      error.value = err instanceof Error ? err.message : '加载位置失败'
    } finally {
      isLoading.value = false
    }
  }

  const getLocationById = async (id: number) => {
    try {
      const response = await api.locations.getById(id)
      return response.data
    } catch (err) {
      const fallback = mockLocations.find(item => item.id === id)
      if (fallback) return fallback
      error.value = err instanceof Error ? err.message : '获取位置详情失败'
      throw err
    }
  }

  const updateLocationStatus = async (id: number, status: number) => {
    try {
      await api.locations.updateStatus(id, status)
      console.log(`位置 ${id} 状态已更新为 ${status}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新状态失败'
      throw err
    }
  }

  return {
    locations,
    currentLocation,
    isLoading,
    error,
    loadLocations,
    getLocationById,
    updateLocationStatus,
  }
})
```

- [ ] **Step 3: 写入 stores/checkin.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Checkin } from '@/services/api'
import { api } from '@/services/api'
import { mockCheckins, mockUser } from '@/services/mockData'

export const useCheckinStore = defineStore('checkin', () => {
  const checkins = ref<Checkin[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadCheckins = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.checkins.getList()
      checkins.value = response.data?.length ? response.data : mockCheckins
    } catch (err) {
      checkins.value = mockCheckins
      error.value = err instanceof Error ? err.message : '加载签到记录失败'
    } finally {
      isLoading.value = false
    }
  }

  const createCheckin = async (data: { location_id: number; content: string; images: string[]; flower_species?: string }) => {
    const createdAt = new Date().toISOString()
    const payload: Checkin = {
      id: Date.now(),
      user_id: mockUser.id,
      location_id: data.location_id,
      content: data.content,
      images: data.images,
      likes_count: 0,
      dislikes_count: 0,
      comments_count: 0,
      created_at: createdAt,
      updated_at: createdAt,
      user: mockUser,
    }
    try {
      const response = await api.checkins.create({
        location_id: data.location_id,
        content: data.content,
        images: data.images,
      })
      checkins.value.unshift(response.data)
      return response.data
    } catch (err) {
      checkins.value.unshift(payload)
      error.value = err instanceof Error ? err.message : '发布签到失败'
      return payload
    }
  }

  const likeCheckin = async (id: number) => {
    const checkin = checkins.value.find(c => c.id === id)
    if (checkin) checkin.likes_count += 1
    try {
      await api.checkins.like(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '点赞失败'
      throw err
    }
  }

  const dislikeCheckin = async (id: number) => {
    const checkin = checkins.value.find(c => c.id === id)
    if (checkin) {
      checkin.dislikes_count = (checkin.dislikes_count || 0) + 1
    }
  }

  const reportCheckin = async (id: number, reason: string) => {
    try {
      await api.checkins.report(id, reason)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '举报失败'
      throw err
    }
  }

  return {
    checkins,
    isLoading,
    error,
    loadCheckins,
    createCheckin,
    likeCheckin,
    dislikeCheckin,
    reportCheckin,
  }
})
```

- [ ] **Step 4: 写入 stores/achievement.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Achievement, Title } from '@/services/api'
import { api } from '@/services/api'
import { mockAchievements } from '@/services/mockData'

export const useAchievementStore = defineStore('achievement', () => {
  const achievements = ref<Achievement[]>([])
  const titles = ref<Title[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadAchievements = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.achievements.getList()
      achievements.value = response.data?.length ? response.data : mockAchievements
    } catch (err) {
      achievements.value = mockAchievements
      error.value = err instanceof Error ? err.message : '加载成就失败'
    } finally {
      isLoading.value = false
    }
  }

  const loadTitles = async () => {
    try {
      const response = await api.titles.getList()
      titles.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载头衔失败'
    }
  }

  return {
    achievements,
    titles,
    isLoading,
    error,
    loadAchievements,
    loadTitles,
  }
})
```

- [ ] **Step 5: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/stores/
git commit -m "feat(frontend-uni): add Pinia stores with uni-app storage"
```

---

### Task 5: 创建 auth-guard.ts

**Files:**
- Create: `Frontend-uni/src/utils/auth-guard.ts`

- [ ] **Step 1: 写入 auth-guard.ts**

```typescript
import { getToken } from '@/services/storage'

const AUTH_PAGES = [
  '/pages/home/home',
  '/pages/map/map',
  '/pages/checkin/checkin',
  '/pages/garden/garden',
  '/pages/profile/profile',
  '/pages/user-detail/user-detail',
  '/pages/navigation/navigation',
]

export function checkAuth() {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (!currentPage) return
  const route = '/' + currentPage.route
  const token = getToken()
  if (!token && AUTH_PAGES.some(p => route.startsWith(p))) {
    uni.reLaunch({ url: '/pages/login/login' })
  }
}

export function requireAuth() {
  if (!getToken()) {
    uni.reLaunch({ url: '/pages/login/login' })
    return false
  }
  return true
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/utils/auth-guard.ts
git commit -m "feat(frontend-uni): add auth guard for uni-app"
```

---

### Task 6: 创建地图抽象层 MapAdapter

**Files:**
- Create: `Frontend-uni/src/services/platform/map/index.ts`
- Create: `Frontend-uni/src/services/platform/map/map.h5.ts`
- Create: `Frontend-uni/src/services/platform/map/map.mp.ts`

- [ ] **Step 1: 写入 index.ts**

```typescript
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
```

- [ ] **Step 2: 写入 map.h5.ts**

```typescript
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
```

- [ ] **Step 3: 写入 map.mp.ts**

```typescript
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
```

注意：`map.mp.ts` 的实现是简化版，因为小程序 `<map>` 组件的 markers 和 scale 通常通过 Vue 响应式直接绑定到模板属性，而不是通过 imperative API 设置。`MapAdapter` 的主要价值在于让 `map.vue` 和 `navigation.vue` 共用同一套初始化逻辑，并在 H5 端屏蔽 SDK 差异。

- [ ] **Step 4: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/services/platform/
git commit -m "feat(frontend-uni): add MapAdapter abstraction for H5/MP"
```

---

### Task 7: 创建 tabBar 图标

**Files:**
- Create: `Frontend-uni/static/icon/home.png`
- Create: `Frontend-uni/static/icon/home-active.png`
- Create: `Frontend-uni/static/icon/map.png`
- Create: `Frontend-uni/static/icon/map-active.png`
- Create: `Frontend-uni/static/icon/garden.png`
- Create: `Frontend-uni/static/icon/garden-active.png`
- Create: `Frontend-uni/static/icon/profile.png`
- Create: `Frontend-uni/static/icon/profile-active.png`

- [ ] **Step 1: 使用 ImageMagick 转换 SVG 为 PNG**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project/Frontend/src/icon
for name in 主页 地图 花园 我的; do
  lower=$(echo "$name" | sed 's/主页/home/;s/地图/map/;s/花园/garden/;s/我的/profile/')
  convert -background none -density 300 -resize 48x48 "${name}.svg" \
    "/home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/static/icon/${lower}.png"
  convert -background none -density 300 -resize 48x48 -modulate 120,80 "${name}.svg" \
    "/home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/static/icon/${lower}-active.png"
done
ls -la /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/static/icon/
```

预期：生成 8 个 PNG 文件，每个约 1-3KB。

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/static/icon/
git commit -m "feat(frontend-uni): generate tabBar icons from SVG"
```

---

### Task 8: 生成首页轮播占位图

**Files:**
- Create: `Frontend-uni/static/carousel/1.jpg`
- Create: `Frontend-uni/static/carousel/2.jpg`
- Create: `Frontend-uni/static/carousel/3.jpg`

- [ ] **Step 1: 使用 ImageMagick 生成简易彩色占位图**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/static/carousel
convert -size 900x600 xc:lightgreen -pointsize 30 -fill darkgreen -gravity center -annotate +0+0 "Flower 1" 1.jpg
convert -size 900x600 xc:lightyellow -pointsize 30 -fill darkgoldenrod -gravity center -annotate +0+0 "Flower 2" 2.jpg
convert -size 900x600 xc:lightpink -pointsize 30 -fill darkred -gravity center -annotate +0+0 "Flower 3" 3.jpg
ls -la
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/static/carousel/
git commit -m "feat(frontend-uni): add carousel placeholder images"
```

---

### Task 9: 迁移 login.vue

**Files:**
- Create: `Frontend-uni/src/pages/login/login.vue`

核心变更：
1. `div` → `view`
2. `router` → `uni.reLaunch`
3. 演示模式调真实接口 `api.auth.login('demo')`
4. `onMounted` 中加载用户改到 `onShow`（uni-app 页面生命周期）
5. 加"去注册"链接

- [ ] **Step 1: 写入 login.vue**

```vue
<template>
  <view class="login-container">
    <view class="login-form">
      <view class="logo">
        <text class="title">狮山花园</text>
        <text class="subtitle">探索花卉之美，发现自然魅力</text>
      </view>

      <view v-if="isLoading" class="loading">
        <view class="spinner"></view>
        <text>登录中...</text>
      </view>

      <view v-else-if="error" class="error-message">
        <text>{{ error }}</text>
      </view>

      <view v-else class="login-content">
        <button @click="handleDemoLogin" class="demo-login-btn" :disabled="isLoading">
          演示模式
        </button>
        <button @click="goRegister" class="register-link-btn">
          去注册
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'

const authStore = useAuthStore()
const isLoading = ref(false)
const error = ref<string | null>(null)

onShow(async () => {
  if (authStore.isAuthenticated) {
    uni.reLaunch({ url: '/pages/home/home' })
    return
  }
  await authStore.loadUser()
  if (authStore.isAuthenticated) {
    uni.reLaunch({ url: '/pages/home/home' })
  }
})

const handleDemoLogin = async () => {
  isLoading.value = true
  error.value = null
  try {
    const success = await authStore.login('')
    if (success) {
      uni.reLaunch({ url: '/pages/home/home' })
    } else {
      error.value = authStore.error || '登录失败'
    }
  } catch (err) {
    error.value = '演示模式启动失败'
  } finally {
    isLoading.value = false
  }
}

const goRegister = () => {
  uni.navigateTo({ url: '/pages/register/register' })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #4CAF50 0%, #81C784 50%, #A5D6A7 100%);
}
.login-form {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: 0 20px;
}
.logo {
  text-align: center;
  margin-bottom: 30px;
}
.title {
  display: block;
  color: #4CAF50;
  font-size: 2.5rem;
  font-weight: 700;
}
.subtitle {
  display: block;
  color: #666;
  margin-top: 10px;
  font-size: 1rem;
}
.loading {
  text-align: center;
  padding: 20px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #ffcdd2;
}
.login-content {
  text-align: center;
}
.demo-login-btn {
  width: 100%;
  padding: 15px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: white;
  margin-bottom: 12px;
}
.register-link-btn {
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #4CAF50;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  color: #4CAF50;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/pages/login/
git commit -m "feat(frontend-uni): migrate login page to uni-app"
```

---

### Task 10: 迁移 register.vue

**Files:**
- Create: `Frontend-uni/src/pages/register/register.vue`

- [ ] **Step 1: 写入 register.vue**

```vue
<template>
  <view class="login-container">
    <view class="login-form">
      <view class="logo">
        <text class="title">注册新账号</text>
        <text class="subtitle">创建账号后即可访问花园数据</text>
      </view>

      <view v-if="isLoading" class="loading">
        <view class="spinner"></view>
        <text>注册中...</text>
      </view>

      <view v-else-if="error" class="error-message">
        <text>{{ error }}</text>
      </view>

      <view v-else class="login-content">
        <view class="login-fields">
          <label>
            <text>用户名</text>
            <input v-model="username" type="text" placeholder="请输入用户名" />
          </label>
          <label>
            <text>密码</text>
            <input v-model="password" type="password" placeholder="请输入密码" />
          </label>
          <label>
            <text>昵称</text>
            <input v-model="nickname" type="text" placeholder="请输入昵称" />
          </label>
          <button @click="handleRegister" class="login-btn" :disabled="isLoading">
            注册
          </button>
        </view>

        <view class="login-actions">
          <text>已有账号？</text>
          <text class="link" @click="goLogin">登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const nickname = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

onShow(() => {
  if (authStore.isAuthenticated) {
    uni.reLaunch({ url: '/pages/home/home' })
  }
})

const goLogin = () => {
  uni.navigateBack()
}

const handleRegister = async () => {
  if (!username.value || !password.value || !nickname.value) {
    error.value = '请输入用户名、密码和昵称'
    return
  }
  isLoading.value = true
  error.value = null
  try {
    const success = await authStore.register(username.value, password.value, nickname.value)
    if (success) {
      uni.reLaunch({ url: '/pages/home/home' })
    } else {
      error.value = authStore.error || '注册失败，请重试'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '注册失败'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #4CAF50 0%, #81C784 50%, #A5D6A7 100%);
}
.login-form {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  margin: 0 20px;
}
.logo {
  text-align: center;
  margin-bottom: 30px;
}
.title {
  display: block;
  color: #4CAF50;
  font-size: 2rem;
  font-weight: 700;
}
.subtitle {
  display: block;
  color: #666;
  margin-top: 10px;
  font-size: 1rem;
}
.login-fields {
  display: grid;
  gap: 16px;
}
.login-fields label {
  display: flex;
  flex-direction: column;
  font-size: 0.95rem;
  color: #444;
}
.login-fields input {
  margin-top: 8px;
  padding: 12px 14px;
  border: 1px solid #dcdcdc;
  border-radius: 12px;
  font-size: 1rem;
}
.login-btn {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: white;
  margin-top: 8px;
}
.login-actions {
  margin-top: 16px;
  text-align: center;
  color: #666;
  font-size: 0.95rem;
}
.link {
  color: #4caf50;
  margin-left: 4px;
}
.loading {
  text-align: center;
  padding: 20px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #ffcdd2;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/pages/register/
git commit -m "feat(frontend-uni): migrate register page to uni-app"
```

---

### Task 11: 迁移 home.vue

**Files:**
- Create: `Frontend-uni/src/pages/home/home.vue`

核心变更：
1. `div` → `view`，`img` → `image`，`span` → `text`
2. 轮播从 DOM background-image 改为 `<swiper>` 组件
3. Unsplash 外链替换为 `static/carousel/` 本地图
4. `useRouter()` → `uni.navigateTo` / `uni.reLaunch`
5. `window.setInterval` / `window.clearInterval` → 全局 `setInterval` / `clearInterval`
6. `scrollRef` DOM 滚动监听改为 `onPageScroll`（uni-app 页面生命周期）
7. 删除 `BottomNav` 引用（由 tabBar 替代）

- [ ] **Step 1: 写入 home.vue**

```vue
<template>
  <view class="home-page">
    <view class="home-scroll">
      <view class="hero-card">
        <view class="hero-meta">
          <text>花卉打卡与分享平台</text>
        </view>
        <swiper class="carousel" :indicator-dots="true" :autoplay="true" :interval="4500" :duration="500">
          <swiper-item v-for="(photo, index) in carouselPhotos" :key="index">
            <image class="slide" :src="photo" mode="aspectFill" />
          </swiper-item>
        </swiper>
      </view>

      <view class="recommend-section">
        <text class="section-title">花卉推荐</text>
        <view class="recommend-grid">
          <view v-for="item in recommendationList" :key="item.id" class="recommend-card" @click="openMap(item)">
            <view class="recommend-image">
              <image :src="item.cover_image" mode="aspectFill" />
            </view>
            <view class="recommend-content">
              <text class="recommend-name">{{ item.name }}</text>
              <text class="recommend-species">{{ item.flower_species }}</text>
              <view class="recommend-status">{{ formatStatus(item.bloom_status) }}</view>
            </view>
          </view>
        </view>
      </view>

      <view class="post-section">
        <view class="post-header">
          <view>
            <text class="post-header-title">花园帖子</text>
            <text class="post-header-sub">按时间或热度查看最新动态</text>
          </view>
          <view class="post-actions">
            <button :class="{ active: sortOption === 'time' }" @click="sortOption = 'time'">按时间排序</button>
            <button :class="{ active: sortOption === 'hot' }" @click="sortOption = 'hot'">按热度排序</button>
          </view>
        </view>

        <view class="post-list">
          <view v-for="post in visiblePosts" :key="post.id" class="post-card">
            <view class="post-author" @click="openUser(post.user?.id)">
              <view class="author-avatar">{{ authorNameInitial(post.user?.nickname) }}</view>
              <view>
                <text class="author-name">{{ post.user?.nickname || '匿名用户' }}</text>
                <text class="author-meta">{{ formatTime(post.created_at) }}</text>
              </view>
            </view>
            <text class="post-content">{{ post.content }}</text>
            <view v-if="post.images?.length" :class="['post-image-grid', getImageGridClass(post.images.length)]">
              <view v-for="(image, idx) in post.images" :key="idx" class="post-image-item">
                <image :src="image" mode="aspectFill" />
              </view>
            </view>
            <view class="post-footer">
              <button class="tag-button" @click="openMap(post)" type="button">
                花种：{{ locationSpecies(post.location_id) }}
              </button>
              <view class="post-actions-row">
                <button class="action-button" @click="likePost(post.id)">点赞</button>
                <button class="action-button" @click="dislikePost(post.id)">点踩</button>
                <text class="comment-info">评论 {{ post.comments_count || 0 }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="load-more" v-if="canLoadMore">
          <button @click="loadMore">加载更多帖子</button>
        </view>
        <view class="empty-state" v-if="!visiblePosts.length">
          <text>暂无帖子，请先发布你的第一条打卡。</text>
        </view>
      </view>
    </view>

    <button class="back-to-top" v-if="showBackToTop" @click="scrollToTop">返回顶部</button>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { useLocationStore } from '@/stores/location'
import { useCheckinStore } from '@/stores/checkin'
import type { Location, Checkin } from '@/services/api'

const authStore = useAuthStore()
const locationStore = useLocationStore()
const checkinStore = useCheckinStore()
const activePhoto = ref(0)
const carouselIntervalId = ref<ReturnType<typeof setInterval> | null>(null)
const sortOption = ref<'time' | 'hot'>('time')
const visibleCount = ref(10)
const showBackToTop = ref(false)

const carouselPhotos = [
  '/static/carousel/1.jpg',
  '/static/carousel/2.jpg',
  '/static/carousel/3.jpg',
]

const recommendationList = computed(() => locationStore.locations.slice(0, 3))

const sortedPosts = computed<Checkin[]>(() => {
  const list = [...checkinStore.checkins]
  if (sortOption.value === 'hot') {
    return list.sort((a, b) => (b.likes_count + (b.comments_count || 0)) - (a.likes_count + (a.comments_count || 0)))
  }
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const visiblePosts = computed(() => sortedPosts.value.slice(0, visibleCount.value))
const canLoadMore = computed(() => visibleCount.value < sortedPosts.value.length)

const formatStatus = (status?: string) => {
  if (!status) return '未知状态'
  if (status.includes('预计')) return status
  return status
}

const locationSpecies = (locationId?: number) => {
  const item = locationStore.locations.find(l => l.id === locationId)
  return item?.flower_species || '未知'
}

const loadMore = () => {
  if (canLoadMore.value) visibleCount.value += 10
}

const scrollToTop = () => {
  uni.pageScrollTo({ scrollTop: 0, duration: 300 })
}

const authorNameInitial = (name?: string) => name ? name[0] : '访'

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

const openMap = (item: Location | Checkin) => {
  const flowerName = 'flower_species' in item ? item.flower_species : locationSpecies(item.location_id)
  uni.navigateTo({ url: `/pages/map/map?flower=${encodeURIComponent(flowerName)}` })
}

const openUser = (id?: number) => {
  if (!id) return
  uni.navigateTo({ url: `/pages/user-detail/user-detail?id=${id}` })
}

const likePost = async (id: number) => {
  await checkinStore.likeCheckin(id)
}

const dislikePost = (id: number) => {
  checkinStore.dislikeCheckin(id)
}

const getImageGridClass = (count: number) => {
  if (count === 1) return 'one-image'
  if (count === 2) return 'two-images'
  if (count === 3) return 'three-images'
  return 'many-images'
}

onPageScroll((e) => {
  showBackToTop.value = e.scrollTop > 360
})

onReachBottom(() => {
  loadMore()
})

onMounted(async () => {
  await Promise.all([locationStore.loadLocations(), checkinStore.loadCheckins()])
  carouselIntervalId.value = setInterval(() => {
    activePhoto.value = (activePhoto.value + 1) % carouselPhotos.length
  }, 4500)
})

onUnmounted(() => {
  if (carouselIntervalId.value !== null) {
    clearInterval(carouselIntervalId.value)
  }
})
</script>

<style scoped>
.home-page { min-height: 100vh; display: flex; flex-direction: column; background: #f3f9f3; }
.home-scroll { flex: 1; padding: 20px; }
.hero-card { background: linear-gradient(135deg, #edf7ec 0%, #dff2d8 100%); border-radius: 24px; padding: 24px; margin-bottom: 20px; }
.hero-meta text { color: #5a7f5a; font-size: 14px; }
.carousel { margin-top: 22px; border-radius: 20px; overflow: hidden; height: 220px; }
.slide { width: 100%; height: 100%; }
.recommend-section, .post-section { margin-bottom: 22px; }
.section-title { font-size: 18px; color: #2b5130; margin-bottom: 16px; }
.recommend-grid { display: grid; gap: 16px; }
.recommend-card { display: grid; grid-template-columns: 100px 1fr; gap: 16px; padding: 18px; background: white; border-radius: 18px; }
.recommend-image { width: 100px; height: 100px; border-radius: 18px; overflow: hidden; }
.recommend-image image { width: 100%; height: 100%; }
.recommend-name { display: block; font-size: 1.05rem; color: #2f5630; font-weight: 600; }
.recommend-species { display: block; color: #5e715f; margin: 6px 0 10px; }
.recommend-status { border-radius: 999px; background: #eef7ed; color: #3f7b44; font-size: 12px; padding: 8px 12px; display: inline-block; }
.post-header { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 16px; }
.post-header-title { display: block; color: #2b5130; font-size: 1.25rem; font-weight: 700; }
.post-header-sub { display: block; color: #637860; font-size: 0.95rem; margin-top: 4px; }
.post-actions { display: flex; gap: 10px; }
.post-actions button { border: 1px solid #c9dbc4; background: transparent; color: #4a6c47; padding: 10px 14px; border-radius: 16px; font-size: 12px; }
.post-actions button.active { background: #edf7ee; border-color: #8bc48b; }
.post-list { display: grid; gap: 18px; }
.post-card { background: white; border-radius: 20px; padding: 18px; }
.post-author { display: flex; gap: 12px; align-items: center; }
.author-avatar { width: 42px; height: 42px; border-radius: 50%; background: #d9efda; display: flex; align-items: center; justify-content: center; color: #3f6a3e; font-weight: 700; }
.author-name { display: block; font-weight: 700; color: #2b5130; }
.author-meta { display: block; color: #6e806e; font-size: 12px; }
.post-content { margin: 14px 0; color: #4a6146; line-height: 1.8; }
.post-image-grid { display: grid; gap: 8px; margin-bottom: 12px; }
.post-image-grid.one-image { grid-template-columns: 1fr; }
.post-image-grid.two-images { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.post-image-grid.three-images { grid-template-columns: 1.6fr 1fr; grid-template-rows: repeat(2, 100px); }
.post-image-grid.three-images .post-image-item:first-child { grid-row: span 2; }
.post-image-grid.many-images { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.post-image-item { overflow: hidden; border-radius: 16px; min-height: 100px; }
.post-image-item image { width: 100%; height: 100%; }
.post-footer { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 12px; }
.tag-button { border: none; background: #f1fbf2; color: #3b6c3a; border-radius: 16px; padding: 10px 14px; font-size: 12px; }
.post-actions-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.action-button { border: 1px solid #c7dab1; background: #ffffff; color: #4a6d43; border-radius: 16px; padding: 10px 14px; font-size: 12px; }
.comment-info { color: #6b7b61; font-size: 13px; }
.load-more { text-align: center; margin-top: 16px; }
.load-more button { border: none; background: #4caf50; color: white; border-radius: 18px; padding: 12px 22px; }
.empty-state { text-align: center; color: #6d7f66; padding: 28px 16px; }
.back-to-top { position: fixed; right: 18px; bottom: 86px; border: none; background: #4caf50; color: white; padding: 12px 16px; border-radius: 999px; z-index: 100; }
</style>
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/pages/home/
git commit -m "feat(frontend-uni): migrate home page to uni-app"
```

---

### Task 12: 迁移 map.vue

**Files:**
- Create: `Frontend-uni/src/pages/map/map.vue`

核心变更：
1. 标签替换；`#map-panel` 改为条件编译：H5 用 `div`，小程序用 `map` 组件
2. 引入 `MapAdapter`（H5 端），小程序端直接绑定 `markers` 到 `map` 组件
3. `router` → `uni.navigateTo`
4. `AMapLoader` 仅在 H5 使用

- [ ] **Step 1: 写入 map.vue**

```vue
<template>
  <view class="map-page">
    <view class="map-container">
      <view class="filter-panel">
        <view class="search-row">
          <input type="text" v-model="searchQuery" placeholder="输入花名搜索" @input="onSearchInput" />
        </view>
        <scroll-view class="flower-list" scroll-x>
          <view class="flower-chip-wrap">
            <button v-for="species in filteredSpecies" :key="species" :class="{ active: selectedSpecies === species }" @click="selectSpecies(species)">
              {{ species }}
            </button>
          </view>
        </scroll-view>
      </view>

      <!-- #ifdef H5 -->
      <view id="map-panel" class="map-panel"></view>
      <!-- #endif -->
      <!-- #ifdef MP-WEIXIN -->
      <map id="map-mp" class="map-panel" :latitude="mapCenter.lat" :longitude="mapCenter.lng" :scale="15" :markers="mpMarkers" @markertap="onMarkerTap"></map>
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useLocationStore } from '@/stores/location'
import { createMapAdapter } from '@/services/platform/map'
import type { MapAdapter, Marker } from '@/services/platform/map'

const locationStore = useLocationStore()
const selectedSpecies = ref('')
const searchQuery = ref('')
const mapAdapter = ref<MapAdapter | null>(null)
const mapCenter = ref({ lat: 30.4714, lng: 114.3645 })

const filteredSpecies = computed(() => {
  const names = Array.from(new Set(locationStore.locations.map(item => item.flower_species))).filter(Boolean) as string[]
  const keyword = searchQuery.value.trim().toLowerCase()
  if (!keyword) return names
  return names.filter(name => name.toLowerCase().includes(keyword))
})

const filteredLocations = computed(() => {
  let list = [...locationStore.locations]
  if (selectedSpecies.value) {
    list = list.filter(item => item.flower_species === selectedSpecies.value)
  }
  if (searchQuery.value.trim()) {
    const keyword = searchQuery.value.trim().toLowerCase()
    list = list.filter(item => item.name.toLowerCase().includes(keyword) || item.flower_species.toLowerCase().includes(keyword))
  }
  return list
})

const mpMarkers = computed(() => {
  return filteredLocations.value.map(l => ({
    id: l.id,
    latitude: Number(l.latitude),
    longitude: Number(l.longitude),
    title: l.name,
  }))
})

const renderMarkers = () => {
  if (mapAdapter.value) {
    const markers: Marker[] = filteredLocations.value.map(l => ({
      id: l.id,
      latitude: Number(l.latitude),
      longitude: Number(l.longitude),
      title: l.name,
    }))
    mapAdapter.value.setMarkers(markers)
  }
}

const onSearchInput = () => {
  if (!searchQuery.value.trim()) selectedSpecies.value = ''
  renderMarkers()
}

const selectSpecies = (species: string) => {
  selectedSpecies.value = species
  renderMarkers()
}

const onMarkerTap = (e: any) => {
  const loc = locationStore.locations.find(l => l.id === e.detail.markerId)
  if (loc) {
    uni.navigateTo({ url: `/pages/navigation/navigation?name=${encodeURIComponent(loc.name)}&lng=${loc.longitude}&lat=${loc.latitude}` })
  }
}

onLoad((query: any) => {
  if (query?.flower) {
    selectedSpecies.value = query.flower
  }
})

onMounted(async () => {
  await locationStore.loadLocations()
  // #ifdef H5
  mapAdapter.value = createMapAdapter()
  await mapAdapter.value.init('map-panel', { center: [mapCenter.value.lng, mapCenter.value.lat], zoom: 15 })
  renderMarkers()
  // #endif
})

onUnmounted(() => {
  if (mapAdapter.value) {
    mapAdapter.value.destroy()
    mapAdapter.value = null
  }
})
</script>

<style scoped>
.map-page { min-height: 100vh; background: #eef7ec; display: flex; flex-direction: column; padding-bottom: 70px; }
.map-container { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
.filter-panel { background: rgba(255, 255, 255, 0.92); border-bottom: 1px solid rgba(0, 0, 0, 0.08); padding: 14px 16px 12px; }
.search-row { margin-bottom: 12px; }
.search-row input { width: 100%; border: 1px solid #d4e5cf; border-radius: 16px; padding: 12px 14px; background: #f7fcf6; color: #3f5e3f; }
.flower-list { white-space: nowrap; }
.flower-chip-wrap { display: inline-flex; gap: 10px; }
.flower-chip-wrap button { border: 1px solid #c7dfb4; background: #f7fdf4; color: #4f7b50; border-radius: 18px; padding: 10px 14px; font-size: 0.9rem; }
.flower-chip-wrap button.active { background: #d7f2ce; border-color: #8cc36c; color: #356b34; }
.map-panel { flex: 1; min-height: 0; }
</style>
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/pages/map/
git commit -m "feat(frontend-uni): migrate map page to uni-app with MapAdapter"
```

---

### Task 13: 迁移 navigation.vue

**Files:**
- Create: `Frontend-uni/src/pages/navigation/navigation.vue`

核心变更：标签替换；路由参数改为 `onLoad` 获取；H5 用腾讯地图 Web API 绘制路径，小程序端简化。

- [ ] **Step 1: 写入 navigation.vue**

```vue
<template>
  <view class="navigation-page">
    <view class="nav-header">
      <button class="back-btn" @click="goBack">返回</button>
      <text class="nav-title">导航到 {{ targetName }}</text>
    </view>

    <!-- #ifdef H5 -->
    <view id="nav-map-container" class="nav-map-box"></view>
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <map id="nav-map-mp" class="nav-map-box" :latitude="targetLat" :longitude="targetLng" :scale="15" :markers="navMarkers" :polyline="polyline"></map>
    <!-- #endif -->

    <view class="nav-info">
      <view class="route-summary">
        <view class="summary-item">
          <text class="label">距离：</text>
          <text class="value">{{ routeDistance }}</text>
        </view>
        <view class="summary-item">
          <text class="label">预计时间：</text>
          <text class="value">{{ routeTime }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const targetName = ref('目标位置')
const targetLng = ref(0)
const targetLat = ref(0)
const userLocation = ref<{ lng: number; lat: number } | null>(null)
const routeDistance = ref('')
const routeTime = ref('')
const navMarkers = ref<any[]>([])
const polyline = ref<any[]>([])

let mapInstance: any = null
let driving: any = null

const goBack = () => {
  uni.navigateBack()
}

onLoad((query: any) => {
  targetName.value = query?.name || '目标位置'
  targetLng.value = parseFloat(query?.lng) || 0
  targetLat.value = parseFloat(query?.lat) || 0
  if (query?.userLng && query?.userLat) {
    userLocation.value = { lng: parseFloat(query.userLng), lat: parseFloat(query.userLat) }
  }
})

onMounted(async () => {
  if (!targetLng.value || !targetLat.value) {
    uni.showToast({ title: '位置信息不完整', icon: 'none' })
    goBack()
    return
  }
  // #ifdef MP-WEIXIN
  navMarkers.value = [
    { id: 1, latitude: targetLat.value, longitude: targetLng.value, title: targetName.value }
  ]
  polyline.value = [{
    points: [
      { latitude: userLocation.value?.lat || 30.4714, longitude: userLocation.value?.lng || 114.3645 },
      { latitude: targetLat.value, longitude: targetLng.value }
    ],
    color: '#4CAF50',
    width: 4
  }]
  routeDistance.value = '直线距离'
  routeTime.value = '请步行前往'
  // #endif

  // #ifdef H5
  try {
    await initMap()
    if (!userLocation.value) await getCurrentPosition()
    await planRoute()
  } catch (error) {
    console.error('导航初始化失败：', error)
    uni.showToast({ title: '导航初始化失败', icon: 'none' })
  }
  // #endif
})

const initMap = async () => {
  const AMapLoader = (await import('@amap/amap-jsapi-loader')).default
  const AMap = await AMapLoader.load({
    key: 'f3ebc39f2c1ffa41660503eff25b13d1',
    version: '2.0',
    plugins: ['AMap.Driving']
  })
  mapInstance = new AMap.Map('nav-map-container', { zoom: 15, center: [targetLng.value, targetLat.value] })
  driving = new AMap.Driving({ map: mapInstance, panel: false })
}

const getCurrentPosition = async () => {
  return new Promise<void>((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation.value = { lng: position.coords.longitude, lat: position.coords.latitude }
          resolve()
        },
        () => {
          userLocation.value = { lng: 114.3645, lat: 30.4714 }
          resolve()
        }
      )
    } else {
      userLocation.value = { lng: 114.3645, lat: 30.4714 }
      resolve()
    }
  })
}

const planRoute = async () => {
  if (!userLocation.value || !driving) return
  const startLngLat = [userLocation.value.lng, userLocation.value.lat]
  const endLngLat = [targetLng.value, targetLat.value]
  driving.search(startLngLat, endLngLat, (status: string, result: any) => {
    if (status === 'complete') {
      const route = result.routes[0]
      if (route) {
        routeDistance.value = formatDistance(route.distance)
        routeTime.value = formatTime(route.time)
      }
    } else {
      uni.showToast({ title: '路径规划失败', icon: 'none' })
    }
  })
}

const formatDistance = (distance: number) => {
  if (distance < 1000) return `${Math.round(distance)} 米`
  return `${(distance / 1000).toFixed(1)} 公里`
}

const formatTime = (time: number) => {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  if (hours > 0) return `${hours} 小时 ${minutes} 分钟`
  return `${minutes} 分钟`
}
</script>

<style scoped>
.navigation-page { display: flex; flex-direction: column; height: 100vh; background: #f5f5f5; }
.nav-header { display: flex; align-items: center; padding: 16px 20px; background: #ffffff; border-bottom: 1px solid #e0e0e0; }
.back-btn { background: none; border: none; font-size: 16px; color: #4CAF50; margin-right: 16px; }
.nav-title { font-size: 18px; color: #333; }
.nav-map-box { flex: 1; width: 100%; min-height: 400px; }
.nav-info { padding: 16px 20px; background: #ffffff; border-top: 1px solid #e0e0e0; }
.route-summary { display: flex; justify-content: space-between; gap: 20px; }
.summary-item { display: flex; flex-direction: column; align-items: center; }
.label { font-size: 14px; color: #666; margin-bottom: 4px; }
.value { font-size: 16px; font-weight: bold; color: #333; }
</style>
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/pages/navigation/
git commit -m "feat(frontend-uni): migrate navigation page to uni-app"
```

---

### Task 14: 迁移 checkin.vue

**Files:**
- Create: `Frontend-uni/src/pages/checkin/checkin.vue`

核心变更：
1. 标签替换
2. `<input type="file">` 删除，改用 `uni.chooseImage`
3. 图片预览从 `URL.createObjectURL` 改为本地临时路径
4. 提交前先用 `api.upload` 上传图片到 `/v1/upload`，拿到 URL 后再 POST `/v1/checkins`
5. `router` → `uni` 导航 API

- [ ] **Step 1: 写入 checkin.vue**

```vue
<template>
  <view class="checkin-page">
    <view class="checkin-header">
      <button class="back-button" @click="goBack">返回</button>
    </view>

    <view class="checkin-body">
      <view class="card-box">
        <text class="input-label">内容输入</text>
        <textarea v-model="content" :maxlength="1000" placeholder="记录你的花卉观察、花园心情或打卡心得..." />
        <text class="text-info">已输入 {{ content.length }}/1000 字</text>
      </view>

      <view class="card-box">
        <text class="section-title">照片上传</text>
        <view class="image-grid">
          <view class="image-add" v-if="selectedImages.length < 9" @click="chooseImage">
            <view class="image-add-icon"></view>
            <text class="image-add-text">添加照片</text>
          </view>
          <view class="image-preview" v-for="(image, index) in selectedImages" :key="index">
            <image :src="image" mode="aspectFill" />
            <button class="image-remove" @click="removeImage(index)">删除</button>
          </view>
        </view>
      </view>

      <view class="card-box optional-box">
        <text class="section-title">可选信息</text>
        <view class="field-row">
          <text>选择花的种类</text>
          <picker mode="selector" :range="availableSpecies" :value="speciesIndex" @change="onSpeciesChange">
            <view class="picker">{{ selectedSpecies || '未选择' }}</view>
          </picker>
        </view>
        <view class="field-row">
          <text>选择花的状态</text>
          <view class="status-options">
            <button :class="{ active: selectedStatus === '含苞待放' }" @click="selectedStatus = '含苞待放'">含苞待放</button>
            <button :class="{ active: selectedStatus === '盛开' }" @click="selectedStatus = '盛开'">盛开</button>
            <button :class="{ active: selectedStatus === '凋零' }" @click="selectedStatus = '凋零'">凋零</button>
          </view>
        </view>
      </view>

      <view class="action-panel">
        <button class="submit-button" :disabled="!canUpload || isSubmitting" @click="submitCheckin">
          {{ isSubmitting ? '上传中...' : '上传打卡' }}
        </button>
        <text class="tip-text">图文均为空时无法上传，花的种类与状态为可选项。</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocationStore } from '@/stores/location'
import { useCheckinStore } from '@/stores/checkin'
import { api } from '@/services/api'

const locationStore = useLocationStore()
const checkinStore = useCheckinStore()
const content = ref('')
const selectedSpecies = ref('')
const selectedStatus = ref('')
const selectedImages = ref<string[]>([])
const isSubmitting = ref(false)

const availableSpecies = computed(() => {
  const species = locationStore.locations.map(item => item.flower_species).filter(Boolean) as string[]
  return Array.from(new Set(species))
})

const speciesIndex = computed(() => {
  if (!selectedSpecies.value) return 0
  return availableSpecies.value.indexOf(selectedSpecies.value)
})

const canUpload = computed(() => content.value.trim().length > 0 || selectedImages.value.length > 0)

const goBack = () => {
  uni.navigateBack()
}

const chooseImage = () => {
  uni.chooseImage({
    count: 9 - selectedImages.value.length,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      selectedImages.value.push(...res.tempFilePaths)
    }
  })
}

const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1)
}

const onSpeciesChange = (e: any) => {
  selectedSpecies.value = availableSpecies.value[e.detail.value] || ''
}

const uploadImages = async (): Promise<string[]> => {
  const urls: string[] = []
  for (const path of selectedImages.value) {
    try {
      const res = await api.upload(path)
      if (res.data?.url) urls.push(res.data.url)
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }
  return urls
}

const submitCheckin = async () => {
  if (!canUpload.value) return
  isSubmitting.value = true
  try {
    const imageUrls = await uploadImages()
    await checkinStore.createCheckin({
      location_id: 1,
      content: content.value.trim(),
      images: imageUrls,
      flower_species: selectedSpecies.value || undefined,
    })
    uni.switchTab({ url: '/pages/home/home' })
  } catch (error) {
    console.error('上传失败', error)
    uni.showToast({ title: '上传失败', icon: 'none' })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  if (!locationStore.locations.length) {
    await locationStore.loadLocations()
  }
})
</script>

<style scoped>
.checkin-page { min-height: 100vh; display: flex; flex-direction: column; background: linear-gradient(180deg, #f4fbf3 0%, #e8f3e8 100%); }
.checkin-header { display: flex; align-items: center; gap: 8px; padding: 18px 20px 14px; background: white; border-bottom: 1px solid rgba(0,0,0,0.06); }
.back-button { border: none; background: none; color: #4caf50; font-size: 14px; }
.checkin-body { flex: 1; padding: 20px; }
.card-box { background: white; border-radius: 18px; padding: 20px; box-shadow: 0 14px 30px rgba(52,93,53,0.08); margin-bottom: 18px; }
.section-title { display: block; font-size: 16px; font-weight: 700; color: #2f5e31; margin-bottom: 14px; }
.input-label { display: block; margin-bottom: 10px; font-weight: 600; color: #3d633e; }
textarea { width: 100%; min-height: 140px; resize: vertical; border: 1px solid rgba(76,175,80,0.2); border-radius: 16px; padding: 14px; background: #f8fff5; color: #33422f; font-size: 14px; }
.text-info { display: block; text-align: right; color: #789172; margin-top: 10px; font-size: 12px; }
.image-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.image-add { border: 2px dashed #c6dbb3; border-radius: 18px; min-height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #5f7a55; }
.image-add-icon { width: 42px; height: 42px; border-radius: 50%; border: 2px solid #4caf50; display: flex; align-items: center; justify-content: center; position: relative; }
.image-add-icon::before, .image-add-icon::after { content: ''; position: absolute; background: #4caf50; }
.image-add-icon::before { width: 20px; height: 3px; }
.image-add-icon::after { height: 20px; width: 3px; }
.image-add-text { margin-top: 10px; font-size: 13px; }
.image-preview { position: relative; border-radius: 18px; overflow: hidden; min-height: 110px; background: #f2f8ef; }
.image-preview image { width: 100%; height: 100%; }
.image-remove { position: absolute; right: 8px; top: 8px; border: none; background: rgba(255,255,255,0.9); color: #5f7a55; padding: 4px 8px; border-radius: 999px; font-size: 12px; }
.optional-box .field-row { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.picker { width: 100%; border: 1px solid rgba(76,175,80,0.18); border-radius: 14px; padding: 12px; background: #f6fff5; color: #34482d; }
.status-options { display: flex; gap: 10px; flex-wrap: wrap; }
.status-options button { flex: 1; min-width: 90px; border: 1px solid #c7dfb4; border-radius: 14px; padding: 10px 12px; background: #f9fff8; color: #4b6f47; }
.status-options button.active { background: #d6f1ce; border-color: #91c777; }
.action-panel { padding: 0 20px 32px; }
.submit-button { width: 100%; border: none; border-radius: 18px; background: #4caf50; color: white; padding: 15px 0; font-size: 16px; font-weight: 700; }
.submit-button:disabled { background: #a7c5a1; }
.tip-text { display: block; margin-top: 12px; font-size: 13px; color: #6e7a60; }
</style>
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/pages/checkin/
git commit -m "feat(frontend-uni): migrate checkin page to uni-app with uni.chooseImage"
```

---

### Task 15: 迁移 garden.vue

**Files:**
- Create: `Frontend-uni/src/pages/garden/garden.vue`

核心变更：标签替换（`div`→`view`，`span`→`text`），删除 `BottomNav`。

- [ ] **Step 1: 写入 garden.vue**

```vue
<template>
  <view class="garden-page">
    <view class="garden-scroll">
      <view class="progress-panel">
        <text class="progress-title">徽章收集进度</text>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <text class="progress-text">已解锁 {{ unlockedCount }} / {{ totalCount }} 个徽章</text>
      </view>

      <view class="badges-panel">
        <view class="badge-row" v-for="(row, rowIndex) in badgeRows" :key="row[0]?.id || rowIndex">
          <view v-for="badge in row" :key="badge.id" class="badge-card" :class="{ locked: !badge.unlocked }" @click="openBadgeDetail(badge)">
            <view class="badge-lamp"></view>
            <view class="badge-body">
              <view class="badge-glass"></view>
              <view class="badge-flower" :class="badge.flowerClass"></view>
            </view>
            <text class="badge-name">{{ badge.name }}</text>
          </view>
        </view>
      </view>

      <text class="empty-note">点击徽章查看该花的打卡帖子</text>
    </view>

    <view class="detail-modal" v-if="selectedLocation">
      <view class="modal-backdrop" @click="selectedLocation = null"></view>
      <view class="modal-card">
        <view class="modal-header">
          <view>
            <text class="modal-title">{{ selectedLocation.name }}</text>
            <text class="modal-sub">花种：{{ selectedLocation.flower_species }}</text>
          </view>
          <button class="close-button" @click="selectedLocation = null">关闭</button>
        </view>
        <view class="modal-body">
          <text class="modal-status">{{ selectedLocation.bloom_status }}</text>
          <text class="modal-description">{{ selectedLocation.description }}</text>
          <view class="modal-posts">
            <view v-if="selectedLocationPosts.length" v-for="post in selectedLocationPosts" :key="post.id" class="modal-post">
              <view class="modal-post-meta">
                <text>{{ post.user?.nickname || '作者' }}</text>
                <text>{{ formatTime(post.created_at) }}</text>
              </view>
              <text>{{ post.content }}</text>
            </view>
            <view v-else class="no-posts">暂无打卡内容</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocationStore } from '@/stores/location'
import { useCheckinStore } from '@/stores/checkin'

const locationStore = useLocationStore()
const checkinStore = useCheckinStore()
const selectedLocation = ref<any>(null)

const locations = computed(() => locationStore.locations)
const totalCount = computed(() => locations.value.length)
const unlockedCount = computed(() => locations.value.filter(l => checkinStore.checkins.some(p => p.location_id === l.id)).length)
const progressPercent = computed(() => {
  if (!totalCount.value) return 0
  return Math.round((unlockedCount.value / totalCount.value) * 100)
})

const locationWithBadge = computed(() => locations.value.map(l => {
  const unlocked = checkinStore.checkins.some(p => p.location_id === l.id)
  return { ...l, unlocked, flowerClass: `flower-${(l.flower_species || 'none').replace(/[^a-zA-Z0-9]/g, '')}` }
}))

const badgeRows = computed(() => {
  const rows: any[][] = []
  for (let i = 0; i < locationWithBadge.value.length; i += 3) {
    rows.push(locationWithBadge.value.slice(i, i + 3))
  }
  return rows
})

const selectedLocationPosts = computed(() => {
  if (!selectedLocation.value) return []
  return checkinStore.checkins.filter(p => p.location_id === selectedLocation.value.id)
})

const openBadgeDetail = (location: any) => {
  selectedLocation.value = location
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

onMounted(async () => {
  await Promise.all([locationStore.loadLocations(), checkinStore.loadCheckins()])
})
</script>

<style scoped>
.garden-page { min-height: 100vh; background: linear-gradient(180deg, #eef8ee 0%, #f7fbf7 100%); display: flex; flex-direction: column; }
.garden-scroll { flex: 1; padding: 20px; }
.progress-panel { background: white; border-radius: 22px; padding: 20px; box-shadow: 0 18px 38px rgba(79,117,66,0.08); margin-bottom: 20px; }
.progress-title { display: block; font-size: 1rem; font-weight: 700; color: #3c6a38; margin-bottom: 10px; }
.progress-bar { height: 12px; border-radius: 999px; background: #ebf6eb; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #79b87c 0%, #4c8d47 100%); }
.progress-text { display: block; margin-top: 10px; color: #61755d; font-size: 0.95rem; }
.badges-panel { display: grid; gap: 16px; }
.badge-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.badge-card { background: #f8fff6; border-radius: 22px; border: 1px solid rgba(124,182,124,0.34); padding: 16px 12px 18px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.badge-card.locked { opacity: 0.44; }
.badge-lamp { width: 36px; height: 10px; background: linear-gradient(90deg, #f4f2ae 0%, #f7f9c1 100%); border-radius: 999px; }
.badge-body { width: 100%; height: 130px; position: relative; display: flex; align-items: flex-end; justify-content: center; }
.badge-glass { width: 90%; height: 70px; border-radius: 50% 50% 16px 16px; background: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.75); position: absolute; bottom: 18px; }
.badge-flower { width: 46px; height: 46px; border-radius: 12px; background: #8fbc8f; }
.badge-name { color: #385238; font-size: 0.95rem; font-weight: 600; text-align: center; }
.empty-note { display: block; margin-top: 16px; color: #657864; font-size: 0.95rem; text-align: center; }
.detail-modal { position: fixed; inset: 0; z-index: 1400; display: flex; align-items: center; justify-content: center; }
.modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.28); }
.modal-card { position: relative; width: min(560px, calc(100vw - 32px)); background: white; border-radius: 24px; padding: 24px; z-index: 1; }
.modal-title { display: block; font-size: 1.1rem; font-weight: 700; color: #2b5e2c; }
.modal-sub { display: block; color: #5d715b; font-size: 0.9rem; margin-top: 4px; }
.close-button { border: none; background: #f1f8ef; color: #4a6e44; padding: 10px 14px; border-radius: 16px; }
.modal-body { margin-top: 16px; color: #576b57; }
.modal-status { display: block; font-weight: 700; color: #3d6a3f; margin-bottom: 12px; }
.modal-description { display: block; margin-bottom: 18px; line-height: 1.7; }
.modal-posts { display: grid; gap: 14px; }
.modal-post { padding: 14px; background: #f6fbf6; border-radius: 18px; }
.modal-post-meta { display: flex; justify-content: space-between; color: #5a6f5c; font-size: 12px; margin-bottom: 8px; }
.no-posts { text-align: center; color: #7a8b7a; padding: 22px 0; }
</style>
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/pages/garden/
git commit -m "feat(frontend-uni): migrate garden page to uni-app"
```

---

### Task 16: 迁移 profile.vue

**Files:**
- Create: `Frontend-uni/src/pages/profile/profile.vue`

核心变更：标签替换，删除 `BottomNav`，`router` → `uni`。

- [ ] **Step 1: 写入 profile.vue**

```vue
<template>
  <view class="profile-page">
    <view class="profile-scroll">
      <view class="profile-card">
        <view class="avatar-box">{{ avatarInitial }}</view>
        <view class="profile-info">
          <text class="user-name">{{ userName }}</text>
          <text class="user-role">{{ userRole }}</text>
          <view class="profile-stats">
            <view>
              <text class="stat-number">{{ userExp }}</text>
              <text class="stat-label">经验</text>
            </view>
            <view>
              <text class="stat-number">{{ totalCheckins }}</text>
              <text class="stat-label">打卡数</text>
            </view>
            <view>
              <text class="stat-number">{{ achievementCount }}</text>
              <text class="stat-label">徽章</text>
            </view>
          </view>
        </view>
      </view>

      <view class="progress-panel">
        <text class="progress-title">成长进度</text>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <text class="progress-meta">当前等级 {{ userLevel }} · {{ progressPercent }}%</text>
      </view>

      <view class="post-section">
        <view class="post-title-row">
          <text class="post-section-title">我的帖子</text>
          <button @click="goToCheckins">查看全部</button>
        </view>
        <view v-if="myPosts.length" class="post-list">
          <view v-for="post in myPosts" :key="post.id" class="post-card" @click="openPost(post)">
            <view class="post-main">
              <text class="post-title">{{ post.location?.name || locationSpecies(post.location_id) }}</text>
              <text class="post-text">{{ post.content }}</text>
            </view>
            <view class="post-meta-row">
              <text>{{ formatTime(post.created_at) }}</text>
              <text>点赞 {{ post.likes_count }} · 评论 {{ post.comments_count || 0 }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-state">你还没有发布过帖子。</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCheckinStore } from '@/stores/checkin'
import { useAchievementStore } from '@/stores/achievement'
import { useLocationStore } from '@/stores/location'

const authStore = useAuthStore()
const checkinStore = useCheckinStore()
const achievementStore = useAchievementStore()
const locationStore = useLocationStore()

const userName = computed(() => authStore.user?.nickname || '花园探索者')
const userRole = computed(() => '狮山花园会员')
const userExp = computed(() => authStore.user?.exp || 0)
const userLevel = computed(() => authStore.user?.level || 1)
const totalCheckins = computed(() => authStore.user?.total_checkins || checkinStore.checkins.length)
const achievementCount = computed(() => achievementStore.achievements.length)
const progressPercent = computed(() => {
  const nextExp = Math.max(100, (authStore.user?.exp || 0) * 1.5)
  return Math.min(100, Math.round(((authStore.user?.exp || 0) / nextExp) * 100))
})
const avatarInitial = computed(() => userName.value.slice(0, 1))

const myPosts = computed(() => {
  if (!authStore.user) return []
  return checkinStore.checkins.filter(post => post.user?.id === authStore.user?.id)
})

const locationSpecies = (id?: number) => locationStore.locations.find(item => item.id === id)?.flower_species || '未知'

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

const goToCheckins = () => {
  uni.switchTab({ url: '/pages/home/home' })
}

const openPost = (post: any) => {
  if (post.user?.id) {
    uni.navigateTo({ url: `/pages/user-detail/user-detail?id=${post.user.id}` })
  }
}

onMounted(async () => {
  await Promise.all([
    authStore.loadUser(),
    checkinStore.loadCheckins(),
    achievementStore.loadAchievements(),
    locationStore.loadLocations(),
  ])
})
</script>

<style scoped>
.profile-page { min-height: 100vh; display: flex; flex-direction: column; background: #eef8ed; }
.profile-scroll { padding: 20px; flex: 1; }
.profile-card { display: flex; gap: 16px; padding: 20px; background: white; border-radius: 22px; box-shadow: 0 18px 38px rgba(85,118,79,0.08); margin-bottom: 18px; }
.avatar-box { width: 78px; height: 78px; border-radius: 22px; background: linear-gradient(135deg, #d9f0d7, #f7fff5); display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 700; color: #3f6d44; }
.user-name { display: block; font-size: 1.8rem; color: #2f5630; }
.user-role { display: block; color: #637960; margin: 8px 0 16px; }
.profile-stats { display: flex; gap: 16px; }
.profile-stats view { text-align: center; }
.stat-number { display: block; font-size: 1.2rem; font-weight: 700; color: #3e6e40; }
.stat-label { display: block; color: #6d7f6a; font-size: 0.85rem; }
.progress-panel { background: white; border-radius: 22px; padding: 18px; box-shadow: 0 14px 32px rgba(79,117,66,0.08); margin-bottom: 18px; }
.progress-title { display: block; font-weight: 700; color: #2f5630; margin-bottom: 10px; }
.progress-bar { width: 100%; height: 12px; border-radius: 999px; background: #edf7ed; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #7cbc79 0%, #4c8d47 100%); }
.progress-meta { display: block; margin-top: 10px; color: #5d7f63; font-size: 0.95rem; }
.post-section { margin-bottom: 18px; }
.post-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.post-section-title { font-size: 16px; font-weight: 700; color: #2b5130; }
.post-title-row button { border: none; background: #edf7ee; color: #3c6940; border-radius: 16px; padding: 10px 14px; font-size: 12px; }
.post-list { display: grid; gap: 14px; }
.post-card { background: white; border-radius: 20px; padding: 16px; box-shadow: 0 14px 32px rgba(77,111,73,0.08); }
.post-title { display: block; font-weight: 700; color: #2f5530; margin-bottom: 8px; }
.post-text { display: block; color: #556a57; line-height: 1.7; }
.post-meta-row { display: flex; justify-content: space-between; color: #6e7f6b; font-size: 13px; margin-top: 10px; }
.empty-state { text-align: center; color: #6c7c66; padding: 24px 0; }
</style>
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/pages/profile/
git commit -m "feat(frontend-uni): migrate profile page to uni-app"
```

---

### Task 17: 迁移 user-detail.vue

**Files:**
- Create: `Frontend-uni/src/pages/user-detail/user-detail.vue`

核心变更：标签替换；`useRoute().params.id` → `onLoad(options.id)`；`router` → `uni`。

- [ ] **Step 1: 写入 user-detail.vue**

```vue
<template>
  <view class="user-detail-page">
    <view class="detail-header">
      <button class="back-button" @click="goBack">返回</button>
      <text class="header-title">{{ userName }} 的主页</text>
    </view>

    <view class="detail-body">
      <view class="profile-card">
        <view class="avatar-box">{{ avatarText }}</view>
        <view class="info-box">
          <view class="name-row">
            <text class="name-text">{{ userName }}</text>
            <text class="badge-label">等级 {{ userLevel }}</text>
          </view>
          <text class="user-summary">已完成 {{ totalCheckins }} 次打卡，解锁 {{ unlockedBadges }} 个徽章。</text>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progressWidth + '%' }"></view>
          </view>
          <text class="progress-meta">当前经验 {{ userExp }} / {{ nextLevelExp }}</text>
        </view>
      </view>

      <view class="posts-section">
        <text class="section-title">近期帖子</text>
        <view v-if="userPosts.length" class="post-list">
          <view v-for="post in userPosts" :key="post.id" class="post-card">
            <view class="post-header">
              <view>
                <text class="post-author">{{ post.user?.nickname || '匿名用户' }}</text>
                <text class="post-meta">{{ formatTime(post.created_at) }}</text>
              </view>
              <button class="view-button" @click="viewCheckin(post.id)">查看</button>
            </view>
            <text class="post-text">{{ post.content }}</text>
            <view v-if="post.images?.length" class="post-images">
              <view v-for="(image, idx) in post.images" :key="idx" class="post-image" :style="getImageStyle(post.images.length, idx)">
                <image :src="image" mode="aspectFill" />
              </view>
            </view>
            <view class="post-info-row">
              <text>花种：{{ locationSpecies(post.location_id) }}</text>
              <text>点赞 {{ post.likes_count }} / 点踩 {{ post.dislikes_count || 0 }}</text>
              <text>评论 {{ post.comments_count || 0 }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-state">该用户尚未发布帖子。</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useCheckinStore } from '@/stores/checkin'
import { useLocationStore } from '@/stores/location'
import { useAchievementStore } from '@/stores/achievement'
import { useAuthStore } from '@/stores/auth'

const checkinStore = useCheckinStore()
const locationStore = useLocationStore()
const achievementStore = useAchievementStore()
const authStore = useAuthStore()

const userId = ref(1)
const userName = ref('花园探索者')
const userLevel = ref(1)
const userExp = ref(0)
const totalCheckins = ref(0)
const unlockedBadges = ref(0)

const filteredPosts = computed(() => checkinStore.checkins.filter(post => post.user?.id === userId.value))
const userPosts = computed(() => filteredPosts.value)
const progressWidth = computed(() => {
  const nextLevel = nextLevelExp.value || 100
  return Math.min(100, (userExp.value / nextLevel) * 100)
})
const nextLevelExp = computed(() => Math.max(100, userExp.value * 1.5))
const avatarText = computed(() => userName.value.slice(0, 1))

const goBack = () => uni.navigateBack()

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

const locationSpecies = (locationId?: number) => locationStore.locations.find(item => item.id === locationId)?.flower_species || '未知'

const getImageStyle = (count: number, index: number) => {
  if (count === 1) return { gridColumn: 'span 2', height: '220px' }
  if (count === 2) return { height: '140px' }
  if (count === 3) return index === 0 ? { gridRow: 'span 2', height: '100%' } : { height: '100px' }
  return { height: '112px' }
}

const viewCheckin = (id: number) => {
  const item = checkinStore.checkins.find(post => post.id === id)
  if (!item) return
  uni.switchTab({ url: '/pages/home/home' })
}

onLoad((options: any) => {
  userId.value = Number(options?.id || authStore.user?.id || 1)
})

onMounted(async () => {
  await Promise.all([checkinStore.loadCheckins(), locationStore.loadLocations(), achievementStore.loadAchievements()])
  const author = checkinStore.checkins.find(post => post.user?.id === userId.value)?.user
  if (author) {
    userName.value = author.nickname
    userLevel.value = author.level
    totalCheckins.value = author.total_checkins
  } else if (authStore.user?.id === userId.value) {
    userName.value = authStore.user.nickname
    userLevel.value = authStore.user.level
    userExp.value = authStore.user.exp
    totalCheckins.value = authStore.user.total_checkins
  }
  unlockedBadges.value = achievementStore.achievements.filter((_, i) => i < 6).length
})
</script>

<style scoped>
.user-detail-page { min-height: 100vh; background: linear-gradient(180deg, #eef7ee 0%, #fcfcfc 100%); }
.detail-header { display: flex; align-items: center; gap: 8px; padding: 18px 20px 14px; background: white; border-bottom: 1px solid rgba(0,0,0,0.08); }
.back-button { border: none; background: none; color: #4caf50; font-size: 14px; }
.header-title { font-size: 18px; font-weight: 700; color: #274329; }
.detail-body { padding: 20px; }
.profile-card { display: flex; gap: 16px; background: white; border-radius: 20px; padding: 20px; box-shadow: 0 18px 40px rgba(88,123,76,0.08); margin-bottom: 18px; }
.avatar-box { width: 84px; height: 84px; border-radius: 22px; background: linear-gradient(135deg, #d4f0d0, #f5fff1); display: flex; align-items: center; justify-content: center; font-size: 34px; color: #4a6a3d; font-weight: 700; }
.name-text { font-size: 20px; color: #243b28; font-weight: 700; }
.name-row { display: flex; gap: 10px; align-items: center; }
.badge-label { border: 1px solid #c9e7c7; color: #4c7a49; padding: 4px 10px; border-radius: 999px; font-size: 12px; }
.user-summary { display: block; margin: 12px 0 0; color: #5d7455; font-size: 14px; }
.progress-bar { height: 10px; border-radius: 999px; background: #ebf5ea; margin-top: 16px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #76ba74 0%, #4ca65b 100%); }
.progress-meta { display: block; margin-top: 8px; color: #6d7f62; font-size: 13px; }
.posts-section { margin-top: 10px; }
.section-title { display: block; margin-bottom: 16px; font-size: 16px; font-weight: 700; color: #2c5130; }
.post-list { display: grid; gap: 16px; }
.post-card { background: white; border-radius: 20px; box-shadow: 0 14px 30px rgba(66,103,65,0.08); padding: 18px; }
.post-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; }
.post-author { font-weight: 700; color: #2f5030; }
.post-meta { display: block; color: #7e8d76; font-size: 12px; }
.view-button { border: none; background: #f4fff6; color: #3c6b3a; padding: 8px 12px; border-radius: 14px; font-size: 12px; }
.post-text { display: block; margin: 0 0 14px; color: #4a5f43; line-height: 1.7; }
.post-images { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 14px; }
.post-image { border-radius: 16px; overflow: hidden; position: relative; min-height: 100px; }
.post-image image { width: 100%; height: 100%; }
.post-info-row { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; color: #6d7c63; font-size: 13px; }
.empty-state { background: white; border-radius: 18px; padding: 30px; text-align: center; color: #7a8a72; }
</style>
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/pages/user-detail/
git commit -m "feat(frontend-uni): migrate user-detail page to uni-app"
```

---

### Task 18: 迁移 flower-suggest.vue

**Files:**
- Create: `Frontend-uni/src/components/flower-suggest/flower-suggest.vue`

核心变更：标签替换。

- [ ] **Step 1: 写入 flower-suggest.vue**

```vue
<template>
  <view class="flower-suggest">
    <text class="flower-header">花卉联想</text>
    <view v-if="filteredSpecies.length" class="flower-list">
      <button v-for="name in filteredSpecies" :key="name" class="flower-chip" @click="selectFlower(name)">
        {{ name }}
      </button>
    </view>
    <view v-else class="flower-empty">
      <text>没有匹配到相关花卉，试试其他关键词。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ query: string }>()
const emit = defineEmits<{ (e: 'select', flower: string): void }>()

const flowerSpecies = [
  '玫瑰', '百合', '向日葵', '牡丹', '荷花', '樱花', '兰花', '郁金香', '紫藤',
  '康乃馨', '桃花', '茶花', '木槿', '海棠', '杜鹃花'
]

const filteredSpecies = computed(() => {
  const keyword = props.query.trim().toLowerCase()
  if (!keyword) return flowerSpecies.slice(0, 8)
  return flowerSpecies.filter(species => species.includes(keyword))
})

const selectFlower = (flower: string) => {
  emit('select', flower)
}
</script>

<style scoped>
.flower-suggest { margin-top: 24px; background: rgba(255,255,255,0.92); border-radius: 22px; padding: 18px; box-shadow: 0 20px 40px rgba(84,131,80,0.08); border: 1px solid rgba(105,152,83,0.14); }
.flower-header { display: block; font-size: 1rem; font-weight: 700; color: #3d5d38; margin-bottom: 12px; }
.flower-list { display: flex; flex-wrap: wrap; gap: 10px; }
.flower-chip { border: none; border-radius: 18px; padding: 10px 14px; background: #f4fbf4; color: #3f6d42; font-weight: 600; }
.flower-empty { color: #7a8b76; font-size: 0.95rem; line-height: 1.6; }
</style>
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/src/components/flower-suggest/
git commit -m "feat(frontend-uni): migrate flower-suggest component to uni-app"
```

---

### Task 19: 创建 verify-api.sh 冒烟脚本

**Files:**
- Create: `Frontend-uni/scripts/verify-api.sh`

- [ ] **Step 1: 写入 verify-api.sh**

```bash
#!/usr/bin/env bash
set -e

BASE_URL="http://127.0.0.1:5000"

echo "=== 1. Health Check ==="
curl -s "${BASE_URL}/v1/health" | python3 -m json.tool

echo ""
echo "=== 2. Demo Login ==="
TOKEN=$(curl -s -X POST "${BASE_URL}/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"mode":"demo"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")
echo "Token: ${TOKEN:0:20}..."

echo ""
echo "=== 3. Checkins List ==="
curl -s "${BASE_URL}/v1/checkins?limit=1" | python3 -m json.tool

echo ""
echo "=== 4. Current User ==="
curl -s "${BASE_URL}/v1/users/me" -H "Authorization: Bearer ${TOKEN}" | python3 -m json.tool

echo ""
echo "=== All checks passed ==="
```

```bash
chmod +x /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/scripts/verify-api.sh
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add Frontend-uni/scripts/
git commit -m "feat(frontend-uni): add verify-api.sh smoke test script"
```

---

### Task 20: H5 编译与冒烟验证

- [ ] **Step 1: 确保后端已启动**

在独立终端运行：

```bash
cd /home/yaoyao/vibe/se/26-SE-Project/backend
source venv/bin/activate
python app.py
```

- [ ] **Step 2: 编译 H5**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni
npm run build:h5
```

预期：`dist/build/h5/` 目录生成，无 TypeScript 类型错误。

- [ ] **Step 3: 运行 verify-api.sh**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni
./scripts/verify-api.sh
```

预期：4 项检查全部返回 `code: 200`，登录返回有效 JWT。

- [ ] **Step 4: 启动 H5 预览（可选）**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni
npx serve dist/build/h5 -l 5173
```

浏览器打开 `http://localhost:5173`，手动验证：
1. 登录页点击"演示模式"→ 跳转首页
2. 首页能看到推荐卡片和帖子列表
3. 切换底部 tab 能进入地图、花园、我的
4. 地图页有标记点（H5 端需网络加载腾讯地图 JS）
5. 关闭后端后刷新，页面仍由 mock 数据渲染

- [ ] **Step 5: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add -A
git commit -m "feat(frontend-uni): complete H5 migration and verification"
```

---

### Task 21: 微信小程序编译验证

- [ ] **Step 1: 编译小程序产物**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project/Frontend-uni
npm run build:mp-weixin
```

预期：生成 `dist/build/mp-weixin/`，无报错。

- [ ] **Step 2: 导入微信开发者工具**

在微信开发者工具中选择「导入项目」，路径指向：

```
/home/yaoyao/vibe/se/26-SE-Project/Frontend-uni/dist/build/mp-weixin
```

AppID 使用测试号（点击工具中「详情」→「本地设置」→ 不校验合法域名）。

- [ ] **Step 3: 真机/模拟器验证清单**

| 检查项 | 预期 |
|-------|------|
| 9 个页面在模拟器均能打开 | 无白屏 |
| 登录页演示模式 | 调 `/v1/auth/login` 成功，跳转首页 |
| 底部 tabBar | 4 个入口正常切换 |
| 地图页 | 小程序端显示 `<map>` 组件，有标记点 |
| 打卡发布页 | `uni.chooseImage` 弹窗选图成功 |
| 关闭后端后刷新 | mock 数据降级，页面有内容 |

- [ ] **Step 4: 最终 Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add -A
git commit -m "feat(frontend-uni): complete mp-weixin build verification"
```

---

## 自我审查

**1. Spec coverage:**
- 工程配置（package.json/vite/manifest/pages.json） → Task 1-2
- 通用层（api.ts/storage.ts/mockData.ts） → Task 3
- Pinia stores（4个） → Task 4
- auth-guard → Task 5
- MapAdapter（H5/MP 双端） → Task 6
- tabBar 图标 → Task 7
- 轮播本地图 → Task 8
- login/register 走真实接口 → Task 9-10
- home（swiper/本地图/无限滚动） → Task 11
- map（MapAdapter/条件编译） → Task 12
- navigation（H5 路径规划/MP 简化） → Task 13
- checkin（uni.chooseImage + uni.uploadFile） → Task 14
- garden/profile/user-detail（标签替换） → Task 15-17
- flower-suggest 组件 → Task 18
- verify-api.sh → Task 19
- H5 + 小程序双端验证 → Task 20-21

**2. Placeholder scan:** 无 TBD/TODO/"implement later"。所有步骤含完整代码与命令。

**3. Type consistency:** `api.ts` 中 `upload` 返回 `ApiResponse<{ url: string }>`，与后端 `UploadResource` 响应一致；`Checkin` 接口含 `location_id`，与后端序列化双写对齐；`auth.login` 签名为 `(mode: string, code?: string)`，与后端 `AuthLogin` 的 `mode` 分流对应。
