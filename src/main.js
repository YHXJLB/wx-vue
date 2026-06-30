import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router' // Import router if using Vue Router

const app = createApp(App)

app.use(createPinia())
app.use(router) // Use router if applicable

app.mount('#app')