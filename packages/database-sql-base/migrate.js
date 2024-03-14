import { fileURLToPath } from "node:url";
import * as path from 'path'
import { promises as fs } from 'fs'
import {
  Kysely,
  Migrator,
  FileMigrationProvider,
} from 'kysely'
import { def_dialect } from './tests/dialect.js'
import { SQL } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 
 * @param {SQL} db_driver 
 */
export async function migrateToLatest(db_driver) {
  if(!db_driver?.client)
    throw new Error('No Kysely client found !!!');
  // /** @type {Kysely<import('./types.sql.tables.js').Database>} */
  // const db = new Kysely({
  //   dialect: def_dialect
  // })

  const db = db_driver.client;

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

migrateToLatest()