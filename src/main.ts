import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { setupDirectives } from './directives'
import './assets/styles/index.scss'
// 引入 Element Plus 中文字体
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const app = createApp(App)

app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.use(pinia)
setupDirectives(app)

app.mount('#app')
