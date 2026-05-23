const API_BASE_URL = 'http://127.0.0.1:5000'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface ApiError extends Error {
  statusCode?: number
}

function makeError(message: string, statusCode?: number): ApiError {
  const err = new Error(message) as ApiError
  if (statusCode !== undefined) err.statusCode = statusCode
  return err
}

export interface User {
  id: number
  openid: string
  nickname: string
  avatar_url: string
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
  comments_count?: number
  liked?: boolean
  created_at: string
  updated_at: string
  user?: User
  location?: Location
}

export interface Comment {
  id: number
  checkin_id: number
  user_id: number
  content: string
  created_at: string
  user?: Pick<User, 'id' | 'nickname' | 'avatar_url'>
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
        timeout: 8000,
        success: (res) => {
          const statusCode = res.statusCode || 0
          const responseData = res.data as ApiResponse<T>
          if (statusCode >= 200 && statusCode < 300) {
            resolve(responseData)
          } else {
            reject(makeError(responseData?.message || `HTTP ${statusCode}`, statusCode))
          }
        },
        fail: (err) => {
          reject(makeError(err.errMsg || 'Network error'))
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

  put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data)
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
          const statusCode = res.statusCode || 0
          let data: any
          try {
            data = JSON.parse(res.data)
          } catch {
            reject(makeError('Invalid upload response', statusCode))
            return
          }
          if (statusCode >= 200 && statusCode < 300) {
            resolve(data)
          } else {
            reject(makeError(data?.message || data?.msg || `HTTP ${statusCode}`, statusCode))
          }
        },
        fail: (err) => {
          reject(makeError(err.errMsg || 'Upload failed'))
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
    getById: (id: number) => apiClient.get<User>(`/v1/users/${id}`),
    getCurrent: () => apiClient.get<User>('/v1/users/me'),
  },

  locations: {
    getList: () => apiClient.get<Location[]>('/v1/locations'),
    getById: (id: number) => apiClient.get<Location>(`/v1/locations/${id}`),
  },

  checkins: {
    getList: () => apiClient.get<Checkin[]>('/v1/checkins'),
    create: (data: { location_id: number; content: string; images: string[]; bloom_report?: string }) =>
      apiClient.post<Checkin>('/v1/checkins', data),
    like: (id: number) => apiClient.put<{ likes_count: number; liked: boolean }>(`/v1/checkins/${id}/like`),
    getComments: (id: number) => apiClient.get<Comment[]>(`/v1/checkins/${id}/comments`),
    addComment: (id: number, content: string) =>
      apiClient.post<Comment>(`/v1/checkins/${id}/comments`, { content }),
    deleteComment: (id: number, commentId: number) =>
      apiClient.delete(`/v1/checkins/${id}/comments/${commentId}`),
  },

  achievements: {
    getList: () => apiClient.get<Achievement[]>('/v1/achievements'),
  },

  titles: {
    getList: () => apiClient.get<Title[]>('/v1/users/me/titles'),
  },

  upload: (filePath: string) => apiClient.uploadFile('/v1/upload', filePath),

  setToken: (token: string) => apiClient.setToken(token),
  clearToken: () => apiClient.clearToken(),
}

export default api
