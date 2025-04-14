/**
 * @import { Database } from './types.sql.tables.js';
 * @import { SqlDialectType } from './types.public.js';
 * @import { Migration } from 'kysely';
 */
import { fileURLToPath } from "node:url";
import * as path from 'path'
import { promises as fs } from 'fs'
import {
  Migrator,
  FileMigrationProvider,
  Kysely,
} from 'kysely'
import { SQL } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const current = {
  driver: undefined
}

export const read_files_in_folder = async (folder='') => {
  const files = await fs.readdir(folder);
  return files.filter(file => file.endsWith('.js'));
}

/**
 * @param {SqlDialectType} dialect_type
 */
export const get_migrations = async (dialect_type='SQLITE') => {
  const folder = 'migrations.' + dialect_type.toLowerCase();
  const files = await fs.readdir(path.join(__dirname, folder));

  /** @type {Record<string, Migration>} */
  const migrations = {};

  for (const file of files) {
    if(file.endsWith('.js')) {
      const file_name = file.split('.').slice(0, -1).join('.');
      const migration = await import(path.join(__dirname, folder, file));
      migrations[file_name] = migration;
    }
  }

  return migrations;
}

// console.log(
//   await get_migrations()
// )


/**
 * 
 * @param {SQL} db_driver 
 * @param {boolean} [release_db_upon_completion=true] 
 */
export async function migrateToLatest(db_driver, release_db_upon_completion=true) {
  if(!db_driver?.client)
    throw new Error('No Kysely client found !!!');

  console.log('Resolving migrations. This may take 2 minutes ...')

  let db = db_driver.client;

  current.driver = db_driver;

  const migrator = new Migrator(
    {
      db,
      provider: new FileMigrationProvider(
        {
          fs,
          path,
          migrationFolder: path.join(
            __dirname, 
            `migrations.${db_driver.dialectType.toLowerCase()}`
          ),
        }
      ),
    }
  );

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach(
    (it) => {
      if (it.status === 'Success') {
        console.log(
          `migration "${it.migrationName}" was executed successfully`
        );
      } else if (it.status === 'Error') {
        console.error(
          `failed to execute migration "${it.migrationName}"`
        );
      }
    }
  );

  if (error) {
    console.error('failed to migrate')
    console.error(JSON.stringify(error, null, 2))
    process.exit(1)
  }

  if(release_db_upon_completion)
    await db.destroy();
}
