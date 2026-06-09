import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTagsViewStore } from '@/stores/tagsView'

// 静态路由（无需权限的路由）
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '仪表盘', icon: 'Odometer', sort: 1 },
      },
    ],
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '403', hidden: true },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true },
  },
]

// 动态路由（需要权限）
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    children: [],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...constantRoutes],
  scrollBehavior: () => ({ top: 0 }),
})

// 白名单路由
const whiteList = ['/login']

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  const tagsViewStore = useTagsViewStore()

  // 设置页面标题
  const title = to.meta?.title as string | undefined
  if (title) {
    document.title = `${title} - ${import.meta.env.VITE_APP_TITLE}`
  }

  if (userStore.isLoggedIn) {
    if (to.path === '/login') {
      // 已登录，跳转至首页
      next({ path: '/' })
    } else {
      // 如果没有用户信息，先获取
      if (!userStore.userInfo) {
        try {
          await userStore.fetchUserInfo()
          // TODO: 根据权限动态添加路由
          next({ ...to, replace: true })
        } catch {
          userStore.resetState()
          next(`/login?redirect=${to.path}`)
          return
        }
      }
      // 添加标签页
      tagsViewStore.addViewFromRoute(to)
      next()
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
