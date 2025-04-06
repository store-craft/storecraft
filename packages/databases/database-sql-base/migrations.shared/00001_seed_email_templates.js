/**
 * @import { Database } from '../types.sql.tables.js'
 */
import { Kysely } from 'kysely'
import { upsert } from '../src/con.templates.js'
import { templates } from '@storecraft/core/assets/seed-templates-v1.js';


/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function up(db) {
  
  //
  // NOTE: seeding templates this way might be problematic. Basically,
  // seeds should not be in the migration folder. But, because we have
  // direct access to the database, we can seed the templates directly.
  // But this may result with problems, because right now we use the 
  // an `api` layer to seed the templates, which always assumes that we
  // have the latest schema. So, if we change the schema, we need to change
  // the seed templates as well. This is not a problem for now, but it may be.
  // So, we need to be careful with this. If any issue arises, please just
  // use kysely directly to seed the tempaltes according to the schema at
  // that time.
  //
  // Example:
  // - later on, we add a new column to the template table.
  // - The `upsert` function always assumes that the schema is up to date.
  // - So, if the upsert method assigns a value like a default value to the new column,
  //   it will fail, because the column does not exist yet.
  // - So, the solution for that, is to write our version of the upsert here.
  // 
  // NOTE 2:
  // - It is always better to seperate the seed data from the migration files.
  // - seeding always assumes that the schema is up to date.
  // - It is more hustle for users to run seeds, which might evolve.
  // - I can afford to run seeds in migration files, because i have direct access to the database,
  //   as oppposed to ORM users etc.
  //   
  //
  for (const template of templates.slice(0)) {
    const result = await upsert(db)(template, template.search);
    if(!result)
      throw new Error('Failed to write a template object')
  }
}

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function down(db) {
}
