# H5 内容管理系统

基于 Vue 3 + TypeScript + Vite + Element Plus 构建的后台管理系统。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3.5（Composition API + `<script setup>`） |
| 语言 | TypeScript 6.0 |
| 构建 | Vite 8.0 |
| UI 组件库 | Element Plus 2.14 |
| 状态管理 | Pinia 3.0 |
| 路由 | Vue Router 4.6 |
| HTTP 客户端 | Axios 1.17 |
| 图表 | ECharts 6.1 |
| 表格导出 | XLSX (SheetJS) |
| 日期处理 | dayjs |
| 工具集 | @vueuse/core |
| 富文本 | TipTap |
| 样式 | SCSS |

## 环境要求

- **Node.js** ≥ 18
- **pnpm**（推荐，项目使用 pnpm 管理依赖）

```bash
# 安装 pnpm（如已安装可跳过）
npm install -g pnpm
```

## 快速开始

### 1. 克隆项目

```bash
git clone <repo-url>
cd h5_manage2
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

项目根目录下有 `.env.development` 和 `.env.production` 文件：

```env
# .env.development（开发环境）
VITE_API_BASE_URL=/api     # 走 Vite 代理，解决跨域
```

开发环境下，前端请求 `/api/*` 会被 Vite 代理转发到后端服务器，代理配置在 `vite.config.ts` 中：

```ts
server: {
  port: 3000,
  open: true,
  proxy: {
    '/api': {
      target: 'http://47.113.194.28:8080',  // 后端地址
      changeOrigin: true,
    },
  },
}
```

如需切换后端地址，修改 `vite.config.ts` 中 `proxy['/api'].target` 即可。

### 4. 启动开发服务器

```bash
pnpm dev
```

浏览器自动打开 `http://localhost:3000`，进入登录页面。

### 5. 构建生产版本

```bash
pnpm build
```

构建产物输出到 `dist/` 目录，可直接部署到静态服务器。

### 6. 预览生产构建

```bash
pnpm preview
```

本地预览构建结果。

## 项目结构

```
h5_manage2/
├── public/                    # 静态资源（不经过构建处理）
├── src/
│   ├── api/                   # API 请求层
│   │   ├── index.ts           # 统一导出
│   │   └── modules/           # 按模块拆分
│   │       ├── auth.ts        # 认证（登录/注册/Token）
│   │       ├── user.ts        # 用户管理
│   │       ├── event.ts       # 活动管理
│   │       ├── dashboard.ts   # 仪表盘
│   │       ├── industry.ts    # 行业管理
│   │       ├── field.ts       # 领域管理
│   │       ├── message.ts     # 消息管理
│   │       ├── role.ts        # 角色管理
│   │       ├── article.ts     # 文章管理
│   │       ├── media.ts       # 媒体管理
│   │       └── file.ts        # 文件上传
│   ├── assets/                # 资源文件（图片、字体、全局样式）
│   │   └── styles/
│   │       └── variables.scss # 全局 SCSS 变量
│   ├── components/            # 公共组件
│   │   ├── common/            # 通用组件（PageHeader、SearchForm…）
│   │   └── editor/            # 富文本编辑器
│   ├── composables/           # 组合式函数（hooks）
│   │   ├── useCrud.ts         # 通用 CRUD + 分页
│   │   ├── usePagination.ts   # 分页逻辑
│   │   ├── useECharts.ts      # ECharts 生命周期管理
│   │   ├── useTable.ts        # 表格多选
│   │   └── usePermission.ts   # 权限检查
│   ├── layouts/               # 布局组件
│   │   ├── DefaultLayout.vue  # 主布局（侧边栏 + 顶栏 + 内容区）
│   │   └── components/        # 布局子组件
│   │       ├── Sidebar.vue    # 侧边导航
│   │       ├── Navbar.vue     # 顶部导航（面包屑、刷新、用户）
│   │       └── AppMain.vue    # 内容区域（keep-alive）
│   ├── router/                # 路由配置
│   │   ├── index.ts           # 路由实例 + 守卫
│   │   └── modules/           # 按模块拆分路由
│   ├── stores/                # Pinia 状态管理
│   │   ├── user.ts            # 用户状态（登录/权限/信息）
│   │   ├── app.ts             # 应用状态（侧边栏/主题）
│   │   └── tagsView.ts        # 标签页导航状态
│   ├── types/                 # TypeScript 类型定义
│   │   ├── api.d.ts           # 通用 API 响应类型
│   │   ├── user.d.ts          # 业务实体类型
│   │   └── global.d.ts        # 全局类型声明
│   ├── utils/                 # 工具函数
│   │   ├── request.ts         # Axios 封装（拦截器/Token 刷新）
│   │   ├── auth.ts            # Token 存储/读取
│   │   ├── format.ts          # 格式化（日期/数字/文件大小）
│   │   └── validate.ts        # 表单验证规则
│   └── views/                 # 页面组件
│       ├── login/             # 登录
│       ├── dashboard/         # 仪表盘
│       ├── system/            # 系统管理（用户/角色/菜单）
│       ├── event/             # 活动管理
│       ├── industry/          # 行业管理
│       ├── field/             # 领域管理
│       ├── message/           # 消息管理
│       ├── content/           # 内容管理（文章/分类）
│       ├── media/             # 媒体库
│       ├── profile/           # 个人中心
│       └── error/             # 错误页面（403/404）
├── .env                       # 通用环境变量
├── .env.development           # 开发环境变量
├── .env.production            # 生产环境变量
├── vite.config.ts             # Vite 配置（代理/别名/SCSS）
├── tsconfig.json              # TypeScript 配置
└── package.json               # 依赖和脚本
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（端口 3000，自动打开浏览器） |
| `pnpm build` | 类型检查 + 构建生产版本到 `dist/` |
| `pnpm preview` | 本地预览构建结果 |
| `pnpm lint` | ESLint 检查并自动修复 |
| `pnpm format` | Prettier 格式化代码 |

## 接口说明

所有 API 请求统一以 `/api` 为前缀，响应格式为：

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "requestId": "xxx"
}
```

- `code === 200` 表示成功
- 其他 code 为业务错误，message 中携带错误描述
- HTTP 4xx/5xx 错误会在右上角弹出错误提示
- 401 未授权时自动尝试刷新 Token，刷新失败则跳转登录页

## 路由说明

| 路径 | 页面 | 权限 |
|------|------|------|
| `/login` | 登录 | 公开 |
| `/dashboard` | 仪表盘 | 登录即可 |
| `/user/list` | 用户列表 | 管理员 |
| `/event/list` | 活动列表 | 登录即可 |
| `/event/:id/registrations` | 活动报名列表 | 登录即可 |
| `/profile` | 个人中心 | 登录即可 |
| `/403` | 无权限 | 公开 |
| `/404` | 未找到 | 公开 |
