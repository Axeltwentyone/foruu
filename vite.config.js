import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base relative : le site peut être servi depuis n'importe quel sous-chemin
// (utile si jamais tu le déploies ailleurs qu'à la racine d'un domaine).
export default defineConfig({
  plugins: [react()],
  base: './',
})
