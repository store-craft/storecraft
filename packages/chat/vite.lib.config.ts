import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

/**
 * https://vitejs.dev/config/
 * 
 * @description This `build` generates a `umd`, `cjs`, `es` build targets
 * of the `Dashboard` at `dist/lib`, both as react functional component and
 * a mounting function, that can be used and wrapped in other 
 * frameworks such as `pure-html`, `vue`, `svelte` etc..
 * 
 */
export default defineConfig(
  {
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    plugins: [
      react(),
      tailwindcss(),
      cssInjectedByJsPlugin(),
      dts({ include: ['src'] })
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
      copyPublicDir: false,
      assetsInlineLimit: 1048576,
      emptyOutDir: true,
      outDir: 'dist/lib',
      // commonjsOptions: {
      //   include: [/node_modules/],
      // },
      cssCodeSplit: false,
      lib: {
        entry: ['src/index.jsx'],
        // name: '@storecraft/dashboard',
        name: 'StorecraftChat',
        formats: ['es', 'cjs', 'umd'],
      },
      rollupOptions: {
        external: [
        ]
      }
    }
  }
);
