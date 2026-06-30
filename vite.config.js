import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import uni from '@dcloudio/vite-plugin-uni' // Uncomment if using uni-app

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // uni(), // Uncomment if using uni-app
  ],
  // Add other Vite configurations as needed for HBuilder compatibility
})