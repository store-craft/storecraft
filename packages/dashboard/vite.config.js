import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(
  {
    plugins: [
      react(),
      cssInjectedByJsPlugin()
    ], 
    resolve: {
      alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
    },
    build: {
      assetsInlineLimit: 1048576
    }
  }
);
