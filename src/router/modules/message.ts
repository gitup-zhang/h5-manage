import type { RouteRecordRaw } from 'vue-router'

const messageRoutes: RouteRecordRaw = {
  path: '/message',
  name: 'Message',
  redirect: '/message/list',
  meta: {
    title: '消息管理',
    icon: 'Message',
    sort: 5,
  },
  children: [
    {
      path: 'list',
      name: 'MessageList',
      component: () => import('@/views/message/MessageList.vue'),
      meta: { title: '消息列表', icon: 'List' },
    },
    {
      path: 'create',
      name: 'MessageCreate',
      component: () => import('@/views/message/MessageCreate.vue'),
      meta: { title: '发送消息', hidden: true },
    },
  ],
}

export default messageRoutes
