import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/login.vue'
import Register from './views/Register.vue'
import Home from './views/Home.vue'
import Map from './views/Map.vue'
import Garden from './views/Garden.vue'
import Profile from './views/Profile.vue'
import Navigation from './views/Navigation.vue'

const routes = [
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/map',
    name: 'Map',
    component: Map,
    meta: { requiresAuth: true }
  },
  {
    path: '/garden',
    name: 'Garden',
    component: Garden,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/navigation',
    name: 'Navigation',
    component: Navigation,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    next('/home')
  } else {
    next()
  }
})

export default router