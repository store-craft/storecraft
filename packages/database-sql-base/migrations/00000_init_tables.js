import { Kysely } from 'kysely'
import { tables } from '../utils.tables.names.js'

/**
 * @typedef {import('../types.sql.tables.js').Database} Database
 */

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function up(db) {
  await db.schema
    .createTable(tables.auth_users)
    .addColumn('id', 'text', (col) =>
      col.primaryKey()
    )
    .addColumn('created_at', 'text')
    .addColumn('updated_at', 'text')
    .addColumn('email', 'text', (col) => col.unique())
    .addColumn('password', 'text')
    .addColumn('roles', 'text')
    .addColumn('confirmed_mail', 'integer')
    .execute()

  await db.schema
    .createTable(tables.tags)
    .addColumn('id', 'text', (col) =>
      col.primaryKey()
    )
    .addColumn('created_at', 'text')
    .addColumn('updated_at', 'text')
    .addColumn('handle', 'text', (col) => col.unique())
    .addColumn('values', 'json')
    .execute()    
}

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function down(db) {
  await db.schema.dropTable(tables.auth_users).execute()
  await db.schema.dropTable(tables.tags).execute()
}