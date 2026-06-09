import type { RouteRecordRaw } from 'vue-router'

const contentRoutes: RouteRecordRaw = {
  path: '/content',
  name: 'Content',
  redirect: '/content/articles',
  meta: {
    title: '内容管理',
    icon: 'Document',
    sort: 2,
  },
  children: [
    {
      path: 'articles',
      name: 'ArticleList',
      component: () => import('@/views/content/ArticleList.vue'),
      meta: {
        title: '文章管理',
        icon: 'Notebook',
        permission: 'article:list',
      },
    },
    {
      path: 'articles/create',
      name: 'ArticleCreate',
      component: () => import('@/views/content/ArticleEdit.vue'),
      meta: {
        title: '新建文章',
        hidden: true,
        permission: 'article:create',
      },
    },
    {
      path: 'articles/:id/edit',
      name: 'ArticleEdit',
      component: () => import('@/views/content/ArticleEdit.vue'),
      meta: {
        title: '编辑文章',
        hidden: true,
        permission: 'article:update',
      },
    },
    {
      path: 'categories',
      name: 'CategoryManage',
      component: () => import('@/views/content/CategoryManage.vue'),
      meta: {
        title: '分类管理',
        icon: 'Collection',
        permission: 'category:list',
      },
    },
  ],
}

export default contentRoutes
