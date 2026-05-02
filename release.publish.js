import 'dotenv/config';
import pkg from './package.json' with { type: 'json' };
import { execSync } from 'node:child_process';

console.log(
  `Publishing all packages with new version ${pkg.version}`
);

// 1. Ensure the token exists
const token = process.env.NODE_AUTH_TOKEN; 
if (!token) {
  console.error("Missing NODE_AUTH_TOKEN in .env");
  process.exit(1);
}

try {
  console.log("Publishing workspaces...");
  
  // 2. Pass process.env into the command execution
  execSync('npm publish -ws --access public', {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      // This maps the .env variable to what .npmrc expects
      NODE_AUTH_TOKEN: token 
    }
  });

  console.log("Published successfully!");
} catch (error) {
  console.error("Publish failed:", error.message);
}