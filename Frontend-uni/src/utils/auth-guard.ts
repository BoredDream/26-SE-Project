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
