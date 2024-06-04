import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/**
 * https://vitejs.dev/config/
 * 
 * @description This `build` generates a website at `dist/website`
 * of the `Dashboard`.
 * 
 */
export default defineConfig(
  {
    plugins: [
      react(),
    ], 
    resolve: {
      alias: [
        { 
          find: "@", 
          replacement: resolve(__dirname, "./src") 
        }
      ]
    },
    build: {
      assetsInlineLimit: 1048576,
      emptyOutDir: false,
      outDir: 'dist/website',
      cssCodeSplit: false,
    }
  }
);
