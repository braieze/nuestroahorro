import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- 1. IMPORTAMOS EL MOTOR VISUAL

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- 2. LO ENCENDEMOS
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 443 
    }
  }
})