import path from 'path'
import removeImports from 'next-remove-imports';
import { fileURLToPath } from 'url';
import NextBundleAnalyzer from '@next/bundle-analyzer';
import { NextConfig } from 'next';

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
const config: NextConfig = withBundleAnalyzer(
  removeImports()(
    {
      experimental: {
        optimizePackageImports: [
          '@scalar/api-reference-react', 
          'react-icons/*'
        ],
      },
      output: 'export',
      images: {
        unoptimized: true
      },
      typescript: {
        ignoreBuildErrors: true,
      },
      reactStrictMode: false,
      trailingSlash: false,
      sassOptions: {
        includePaths: [
          path.join(__dirname, './src'),
          path.join(__dirname, './pages'),
        ]
      },
      eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
      },
    }
  )
);

export default config;