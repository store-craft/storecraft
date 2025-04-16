import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
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
      tailwindcss()
    ], 
    resolve: {
      alias: [
        { 
          find: "@", 
          replacement: resolve(__dirname, "./src") 
        },
        // {
        //   find: 'react',
        //   replacement: 'https://esm.sh/react',
        // },
        // {
        //   find: 'react/jsx-runtime',
        //   replacement: 'https://esm.sh/react/jsx-runtime',
        // },
        // {
        //   find: 'react-dom',
        //   replacement: 'https://esm.sh/react-dom'
        // },
      ]
    },
    build: {
      assetsInlineLimit: 1048576,
      emptyOutDir: true,
      outDir: 'dist/website',
      cssCodeSplit: false,
      
      rollupOptions: {
        treeshake: 'smallest',
        // external: [
        //   'react',
        //   'react-dom',
        //   'react/jsx-runtime',
        //   'react/jsx-dev-runtime',
        // ]
      }
    }
  }
);
