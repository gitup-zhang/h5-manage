import type { RouteRecordRaw } from 'vue-router'

const eventRoutes: RouteRecordRaw = {
  path: '/event',
  name: 'Event',
  redirect: '/event/list',
  meta: {
    title: '活动管理',
    icon: 'Calendar',
    sort: 4,
  },
  children: [
    {
      path: 'list',
      name: 'EventList',
      component: () => import('@/views/event/EventList.vue'),
      meta: { title: '活动列表', icon: 'List' },
    },
    {
      path: 'create',
      name: 'EventCreate',
      component: () => import('@/views/event/EventEdit.vue'),
      meta: { title: '创建活动', hidden: true },
    },
    {
      path: ':id/edit',
      name: 'EventEdit',
      component: () => import('@/views/event/EventEdit.vue'),
      meta: { title: '编辑活动', hidden: true },
    },
    {
      path: ':id/registrations',
      name: 'EventRegistrations',
      component: () => import('@/views/event/EventRegistrations.vue'),
      meta: { title: '报名列表', hidden: true },
    },
  ],
}

export default eventRoutes
