import type { RouteRecordRaw } from 'vue-router'

const userInfoFieldRoutes: RouteRecordRaw = {
  path: '/user-info-field',
  name: 'UserInfoField',
  redirect: '/user-info-field/list',
  meta: {
    title: '用户信息字段管理',
    icon: 'Document',
    sort: 6,
  },
  children: [
    {
      path: 'list',
      name: 'UserInfoFieldList',
      component: () => import('@/views/system/UserInfoFieldManage.vue'),
      meta: {
        title: '字段列表',
        icon: 'List',
      },
    },
  ],
}

export default userInfoFieldRoutes
