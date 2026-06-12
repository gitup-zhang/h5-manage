import type { RouteRecordRaw } from 'vue-router'

const industryRoutes: RouteRecordRaw = {
  path: '/industry',
  name: 'Industry',
  redirect: '/industry/list',
  meta: {
    title: '行业管理',
    icon: 'Files',
    sort: 2,
  },
  children: [
    {
      path: 'list',
      name: 'IndustryList',
      component: () => import('@/views/industry/IndustryManage.vue'),
      meta: {
        title: '行业列表',
        icon: 'List',
      },
    },
  ],
}

export default industryRoutes
