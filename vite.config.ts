import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: "/Cardle-deploy/",
  plugins: [react()],

  preview: {
    host:true,
    port: 8080,
  }
})
