// API服务层
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

// In development, Vite can proxy `/api` requests to the backend to avoid CORS issues.
// For production, set VITE_API_BASE_URL to the backend host if needed.

type QueryParams = Record<string, string | number | boolean | undefined>

// API响应类型定义
export interface ApiResponse<T = any> {
  code: number
  message?: string
  data: T
}

export interface User {
  id: number
  username?: string
  nickname: string
  avatar_url: string | null
  role?: string
  access_token?: string
  level?: number
  exp?: number
  total_checkins?: number
  achievements?: Achievement[]
  titles?: Title[]
}

export interface Location {
  id: number
  flower_place_id: number
  flower_id: number
  place_id: number
  name: string
  flower_species: string
  latitude: string
  longitude: string
  bloom_status: string
  description?: string
  historical_bloom_start?: string | null
  historical_bloom_end?: string | null
  cover_image?: string
  checkin_count?: number
}

export interface Flower {
  id: number
  species: string
  scientific_name: string
  bloom_status: string
  cover_image: string
}

export interface FlowerDetail extends Flower {
  family: string
  genus: string
  historical_bloom_start: string
  historical_bloom_end: string
  description: string
  places: Place[]
}

export interface Place {
  id: number
  name: string
  description: string
  latitude: number
  longitude: number
  flowers?: Array<{
    id: number
    species: string
    bloom_status: string
  }>
}

export interface FlowerPlaceMapItem {
  flower_place_id: number
  flower_id: number
  flower_name: string
  place_id: number
  place_name: string
  latitude: number
  longitude: number
  bloom_status: string
}

export interface Checkin {
  id: number
  user_id: number
  flower_place_id: number
  bloom_report: string
  content: string
  images: string[]
  likes_count: number
  created_at: string
  user?: {
    id: number
    nickname: string
    avatar_url: string | null
  }
  flower?: {
    id: number
    species: string
  }
  place?: {
    id: number
    name: string
  }
}

export interface Achievement {
  id: number
  name?: string
  icon?: string
  description: string
}

export interface Title {
  id: number
  description: string
}

// HTTP请求工具函数
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
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

  private buildQueryString(params?: QueryParams) {
    if (!params) return ''
    const query = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')
    return query ? `?${query}` : ''
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: QueryParams
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}${this.buildQueryString(params)}`
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    }

    const isFormData = options.body instanceof FormData
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || `HTTP error! status: ${response.status}`)
      }

      return {
        code: response.status,
        message: payload?.message || response.statusText,
        data: payload,
      }
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string, params?: QueryParams): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, params)
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

const apiClient = new ApiClient(API_BASE_URL)

export const api = {
  health: () => apiClient.get('/health'),

  auth: {
    login: (username: string, password: string) =>
      apiClient.post<User>('/api/user/login', JSON.stringify({ username, password })),
    register: (payload: { username: string; password: string; nickname: string; avatar_url?: string }) =>
      apiClient.post<User>('/api/user/register', JSON.stringify(payload)),
  },

  user: {
    getInfo: () => apiClient.get<User>('/api/user/info'),
    updateInfo: (payload: { nickname: string; avatar_url?: string }) =>
      apiClient.put<{ message: string }>('/api/user/info', JSON.stringify(payload)),
    getAchievements: () => apiClient.get<Achievement[]>('/api/user/achievements'),
    getTitles: () => apiClient.get<Title[]>('/api/user/titles'),
  },

  flowers: {
    list: (status?: string, species?: string) =>
      apiClient.get<Flower[]>('/api/flowers', { status, species }),
    detail: (id: number) => apiClient.get<FlowerDetail>(`/api/flowers/${id}`),
    bloomStatus: (id: number) =>
      apiClient.get<{ current_status: string; historical_bloom_start: string; historical_bloom_end: string }>(
        `/api/flowers/${id}/bloom-status`
      ),
    checkins: (id: number) => apiClient.get<Checkin[]>(`/api/flowers/${id}/checkins`),
  },

  places: {
    list: (flowerId?: number) => apiClient.get<Place[]>('/api/places', { flower_id: flowerId }),
    detail: (id: number) => apiClient.get<Place>(`/api/places/${id}`),
    checkins: (id: number) => apiClient.get<Checkin[]>(`/api/places/${id}/checkins`),
  },

  map: {
    flowers: () => apiClient.get<FlowerPlaceMapItem[]>('/api/map/flowers'),
    filter: (flowerId: number) => apiClient.get<FlowerPlaceMapItem[]>('/api/map/filter', { flower_id: flowerId }),
  },

  checkins: {
    getList: (params?: QueryParams) => apiClient.get<Checkin[]>('/api/checkins', params),
    getById: (id: number) => apiClient.get<Checkin>(`/api/checkins/${id}`),
    create: (payload: {
      user_id: number
      flower_place_id: number
      bloom_report: string
      content?: string
      images?: File[]
    }) => {
      const formData = new FormData()
      formData.append('user_id', String(payload.user_id))
      formData.append('flower_place_id', String(payload.flower_place_id))
      formData.append('bloom_report', payload.bloom_report)
      if (payload.content) {
        formData.append('content', payload.content)
      }
      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((image, index) => {
          formData.append('images', image)
        })
      }
      return apiClient.post<Checkin>('/api/checkins', formData)
    },
    like: (id: number) => apiClient.put<{ likes_count: number }>(`/api/checkins/${id}/like`, JSON.stringify({})),
    report: (id: number, reason: string) =>
      apiClient.post<{ message: string }>(`/api/checkins/${id}/report`, JSON.stringify({ reason })),
  },

  achievements: {
    list: () => apiClient.get<Achievement[]>('/api/achievements'),
    getList: () => apiClient.get<Achievement[]>('/api/achievements'),
  },

  titles: {
    list: () => apiClient.get<Title[]>('/api/titles'),
    getList: () => apiClient.get<Title[]>('/api/titles'),
  },

  setToken: (token: string) => apiClient.setToken(token),
  clearToken: () => apiClient.clearToken(),
}

export default api