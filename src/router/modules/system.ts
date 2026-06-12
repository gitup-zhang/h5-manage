import type { RouteRecordRaw } from 'vue-router'

const systemRoutes: RouteRecordRaw = {
  path: '/system',
  name: 'System',
  redirect: '/system/users',
  meta: {
    title: '系统管理',
    icon: 'Setting',
    sort: 99,
  },
  children: [
    {
      path: 'roles',
      name: 'RoleManage',
      component: () => import('@/views/system/RoleManage.vue'),
      meta: {
        title: '角色管理',
        icon: 'Avatar',
        permission: 'role:list',
      },
    },
    {
      path: 'menus',
      name: 'MenuManage',
      component: () => import('@/views/system/MenuManage.vue'),
      meta: {
        title: '菜单管理',
        icon: 'Menu',
        permission: 'menu:list',
      },
    },
  ],
}

export default systemRoutes
