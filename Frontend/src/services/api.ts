// API服务层 - 使用相对路径，通过 Vite proxy 转发到后端
const API_BASE_URL = ''

// 将后端返回的图片 URL 标准化为相对路径（通过 Vite proxy 访问）
export const normalizeImageUrl = (url: string | null | undefined): string => {
  if (!url) return ''
  // 如果是以 http://localhost:3001 开头的绝对路径，替换为相对路径
  if (url.startsWith('http://localhost:3001')) {
    return url.replace('http://localhost:3001', '')
  }
  // 如果是以 http://101.37.240.166:5555 开头的旧数据路径，保留原样（外部可访问）
  return url
}

// API响应类型定义
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

// HTTP请求工具函数
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // 从localStorage获取token
    this.token = localStorage.getItem('token')
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // 添加认证头
    if (this.token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.token}`,
      }
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// 创建API客户端实例
const apiClient = new ApiClient(API_BASE_URL)

// API服务方法
export const api = {
  // 通用请求方法
  get: <T>(endpoint: string) => apiClient.get<T>(endpoint),
  post: <T>(endpoint: string, data?: any) => apiClient.post<T>(endpoint, data),

  // 健康检查
  health: () => apiClient.get('/health'),

  // 认证相关
  auth: {
    login: (code: string) => apiClient.post<{ token: string; user: User }>('/v1/auth/login', { code }),
  },

  // 用户相关
  users: {
    getList: () => apiClient.get<User[]>('/v1/users'),
    getById: (id: number) => apiClient.get<User>(`/v1/users/${id}`),
    getCurrent: () => apiClient.get<User>('/v1/users/me'),
  },

  // 位置相关
  locations: {
    getList: () => apiClient.get<Location[]>('/v1/locations'),
    getById: (id: number) => apiClient.get<Location>(`/v1/locations/${id}`),
    updateStatus: (id: number, status: number) => apiClient.patch(`/v1/locations/${id}/status`, { status }),
  },

  // 签到相关
  checkins: {
    getList: () => apiClient.get<Checkin[]>('/v1/checkins'),
    create: (data: { location_id: number; content: string; images: string[]; bloom_report?: string }) =>
      apiClient.post<Checkin>('/v1/checkins', data),
    like: (id: number) => apiClient.post(`/v1/checkins/${id}/like`),
    report: (id: number, reason: string) => apiClient.post(`/v1/checkins/${id}/report`, { reason }),
  },

  // 订阅相关
  subscriptions: {
    getList: () => apiClient.get('/v1/subscriptions'),
  },

  // 成就相关
  achievements: {
    getList: () => apiClient.get<Achievement[]>('/v1/achievements'),
  },

  // 头衔相关
  titles: {
    getList: () => apiClient.get<Title[]>('/v1/titles'),
  },

  // 管理员相关
  admin: {
    getStats: () => apiClient.get('/v1/admin/stats'),
  },

  // 设置token
  setToken: (token: string) => apiClient.setToken(token),
  clearToken: () => apiClient.clearToken(),
}

export default api