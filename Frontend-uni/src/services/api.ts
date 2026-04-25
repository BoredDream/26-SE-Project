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
