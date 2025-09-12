import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // or '192.168.80.118'
    port: 5173
  },
  https: {
    key: "./cert/key.pem",
    cert: "./cert/cert.pem",
  }
})



