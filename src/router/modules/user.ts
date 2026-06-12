import type { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw = {
  path: '/user',
  name: 'User',
  redirect: '/user/list',
  meta: {
    title: '用户管理',
    icon: 'User',
    sort: 1,
  },
  children: [
    {
      path: 'list',
      name: 'UserList',
      component: () => import('@/views/system/UserManage.vue'),
      meta: {
        title: '用户列表',
        icon: 'List',
      },
    },
  ],
}

export default userRoutes
