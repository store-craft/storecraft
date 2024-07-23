import path from 'path'
import removeImports from 'next-remove-imports';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const obj = removeImports()(
  {
    
    output: 'export',
    images: {
      unoptimized: true
    },
    reactStrictMode: true,
    trailingSlash: false,
    // webpackDevMiddleware: config => {
    // 	config.watchOptions = {
    // 		poll: 1000,
    // 		aggregateTimeout: 300
    // 	}

    // 	return config
    // },
    sassOptions: {
      includePaths: [path.join(__dirname, './src')]
    },
  }
);

export default obj;
