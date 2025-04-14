import { SQL } from "@storecraft/database-sql-base";
import { AggregateDialect } from "@storecraft/database-sql-base/kysely.aggregate.dialect.js";
import { get_migrations } from "@storecraft/database-sql-base/migrate.js";
import { Kysely, Migrator } from "kysely";
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 
 * @param {SQL} db_driver 
 * @param {boolean} [destroy_db_upon_completion=true] 
 */
export async function migrateToLatest(
  db_driver, destroy_db_upon_completion=true
) {
  const db = db_driver?.client;

  if(!db)
    throw new Error('No Kysely client found !!!');

  console.log(
    'Resolving migrations. This may take 2 minutes ...'
  );

  const migrations = await get_migrations(db_driver.dialectType);

  if(!migrations)
    throw new Error('No migrations found !!!');

  const sorted = Object
  .entries(migrations)
  .sort((a, b) => a[0].localeCompare(b[0]));

  /** @type {Record<string, import("kysely").Migration>} */
  const rewritten_migrations = {};

  for (const [name, migration] of sorted) {
    // console.log(`Executing virtual migration "${name}" ...`);
    const up_agg_dialect = new AggregateDialect(
      { dialect: db_driver.config.dialect, }
    );
    const up_agg_kysely = new Kysely(
      { dialect: up_agg_dialect }
    );
    const down_agg_dialect = new AggregateDialect(
      { dialect: db_driver.config.dialect, }
    );
    const down_agg_kysely = new Kysely(
      { dialect: down_agg_dialect }
    );
    
    await migration.up(up_agg_kysely);
    await migration.down(down_agg_kysely);

    // now get the queries
    const queries_up = up_agg_dialect.queries;
    const queries_down = down_agg_dialect.queries;
    
    // turso dialect supports transactions and also batch
    // we take adavantage of this
    rewritten_migrations[name] = {
      up: async (db) => {
        await db.transaction().execute(
          async (trx) => {
            for (const query of queries_up) {
              await trx.executeQuery(query)
            }
          }
        );
      },
      down: async (db) => {
        await db.transaction().execute(
          async (trx) => {
            for (const query of queries_down) {
              await trx.executeQuery(query)
            }
          }
        );
      }
    }
  }

  const migrator = new Migrator(
    {
      db,
      provider: {
        getMigrations: async () => {
          return rewritten_migrations;
        }
      }
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

  if(destroy_db_upon_completion)
    await db.destroy();
}
  