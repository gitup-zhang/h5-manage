import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTagsViewStore } from '@/stores/tagsView'
import userRoutes from './modules/user'
import industryRoutes from './modules/industry'
import fieldRoutes from './modules/field'
import eventRoutes from './modules/event'
import messageRoutes from './modules/message'

// 将所有业务模块路由挂载到 DefaultLayout 的 children 下
// 这样导航到任何页面时，侧边栏和顶栏始终存在
function getBusinessRoutes(): RouteRecordRaw[] {
  const modules = [userRoutes, industryRoutes, fieldRoutes, eventRoutes, messageRoutes]
  const children: RouteRecordRaw[] = []

  for (const mod of modules) {
    if (mod.children) {
      // 将模块下的子路由直接加入（去掉中间层级，简化 path）
      for (const child of mod.children) {
        if (!child.component) continue
        children.push({
          path: `${mod.path.replace('/', '')}/${child.path}`, // e.g. user/list
          name: child.name,
          component: child.component,
          meta: {
            ...child.meta,
            parentTitle: mod.meta?.title as string | undefined,
            parentIcon: mod.meta?.icon as string | undefined,
            parentSort: (mod.meta?.sort as number) ?? 99,
          },
        } as RouteRecordRaw)
      }
    }
  }

  return children
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录（无布局）
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/LoginView.vue'),
      meta: { title: '登录', hidden: true },
    },
    // 主布局（所有登录后页面都在此布局内）
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
          meta: { title: '仪表盘', icon: 'Odometer', sort: 0 },
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/profile/ProfileView.vue'),
          meta: { title: '个人中心', icon: 'UserFilled', hidden: true },
        },
        ...getBusinessRoutes(),
      ],
    },
    // 重定向（用于刷新页面，强制 keep-alive 组件重新挂载）
    { path: '/redirect/:path(.*)', name: 'Redirect', component: () => import('@/views/RedirectView.vue'), meta: { title: '刷新中...', hidden: true } },
    // 错误页面（无布局）
    { path: '/403', name: 'Forbidden', component: () => import('@/views/error/403.vue'), meta: { title: '403', hidden: true } },
    { path: '/404', name: 'NotFound', component: () => import('@/views/error/404.vue'), meta: { title: '404', hidden: true } },
    // 兜底
    { path: '/:pathMatch(.*)*', redirect: '/404' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

// 白名单
const whiteList = ['/login', '/403', '/404']

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  const tagsViewStore = useTagsViewStore()

  const title = to.meta?.title as string | undefined
  if (title) {
    document.title = `${title} - ${import.meta.env.VITE_APP_TITLE}`
  }

  if (userStore.isLoggedIn) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (!userStore.userInfo) {
        try {
          await userStore.fetchUserInfo()
          next({ ...to, replace: true })
        } catch {
          userStore.resetState()
          next(`/login?redirect=${to.path}`)
          return
        }
      }
      tagsViewStore.addViewFromRoute(to)
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
