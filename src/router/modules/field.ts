import type { RouteRecordRaw } from 'vue-router'

const fieldRoutes: RouteRecordRaw = {
  path: '/field',
  name: 'Field',
  redirect: '/field/list',
  meta: {
    title: '领域管理',
    icon: 'Grid',
    sort: 3,
  },
  children: [
    {
      path: 'list',
      name: 'FieldList',
      component: () => import('@/views/field/FieldManage.vue'),
      meta: {
        title: '领域列表',
        icon: 'List',
      },
    },
  ],
}

export default fieldRoutes
