import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import { MotionPlugin } from '@vueuse/motion'
import VueApexCharts from 'vue3-apexcharts'

import App from './App.vue'
import router from './router'
import '@/assets/css/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(autoAnimatePlugin)
app.use(MotionPlugin)
app.use(VueApexCharts)

app.mount('#app')
