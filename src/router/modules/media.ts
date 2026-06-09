import type { RouteRecordRaw } from 'vue-router'

const mediaRoutes: RouteRecordRaw = {
  path: '/media',
  name: 'Media',
  redirect: '/media/library',
  meta: {
    title: '媒体管理',
    icon: 'PictureFilled',
    sort: 3,
  },
  children: [
    {
      path: 'library',
      name: 'MediaLibrary',
      component: () => import('@/views/media/MediaLibrary.vue'),
      meta: {
        title: '媒体库',
        icon: 'Picture',
        permission: 'media:list',
      },
    },
  ],
}

export default mediaRoutes
