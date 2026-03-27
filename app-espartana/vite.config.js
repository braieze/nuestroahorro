import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Le dice a Vite que exponga el proyecto a toda la red (0.0.0.0)
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 443 // ¡LA MAGIA! Fuerza a Codespaces a usar el puerto web estándar para el túnel
    }
  }
})