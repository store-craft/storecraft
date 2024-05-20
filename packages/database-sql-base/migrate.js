import { fileURLToPath } from "node:url";
import * as path from 'path'
import { promises as fs } from 'fs'
import {
  Migrator,
  FileMigrationProvider,
} from 'kysely'
import { SQL } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const current = {
  driver: undefined
}

/**
 * 
 * @param {SQL} db_driver 
 * @param {boolean} [destroy_db_upon_completion=true] 
 */
export async function migrateToLatest(db_driver, destroy_db_upon_completion=true) {
  if(!db_driver?.client)
    throw new Error('No Kysely client found !!!');

  console.log('Resolving migrations')

  let db = db_driver.client;

  current.driver = db_driver;

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(
        __dirname, 
        `migrations.${db_driver.dialectType.toLowerCase()}`
      ),
    }),
  })

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(
        `migration "${it.migrationName}" was executed successfully`
        );
    } else if (it.status === 'Error') {
      console.error(
        `failed to execute migration "${it.migrationName}"`
        );
    }
  })

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  if(destroy_db_upon_completion)
    await db.destroy()
}
