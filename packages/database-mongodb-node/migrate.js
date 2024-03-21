import { fileURLToPath } from "node:url";
import { MongoDB } from "./index.js";
import { config, up } from 'migrate-mongo';
import * as path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 
 * @param {MongoDB} driver 
 */
export async function migrateToLatest(driver) {
  console.log('Starting Migrations');
  const config_migrate = {
    migrationsDir: path.join(__dirname, 'migrations'),
    changelogCollectionName: "migrations",
    migrationFileExtension: ".js"
  };

  config.set(config_migrate);
  const results = await up(
    driver.mongo_client.db(driver.name), driver.mongo_client
  );

  console.log('results: \n', results)
}
