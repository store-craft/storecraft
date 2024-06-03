import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(
  {
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    plugins: [
      react(),
      cssInjectedByJsPlugin()
    ], 
    resolve: {
      alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
    },
    build: {
      assetsInlineLimit: 1048576,
      emptyOutDir: false,
      outDir: 'dist/browser',
      // commonjsOptions: {
      //   include: [/node_modules/],
      // },
      cssCodeSplit: false,
      lib: {
        entry: ['src/index.jsx'],
        name: '@storecraft/dashboard',
        formats: ['umd'],
      },
      rollupOptions: {
        external: [
        ]
      }
    }
  }
);
