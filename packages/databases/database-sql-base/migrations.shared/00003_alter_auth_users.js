/**
 * @import { Database } from '../types.sql.tables.js'
 */
import { Kysely } from 'kysely'

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function up(db) {

  try {
    await db.schema
    .alterTable('auth_users')
    .addColumn('firstname', 'text')
    .execute();
  
    await db.schema
    .alterTable('auth_users')
    .addColumn('lastname', 'text')
    .execute();
  } catch (e) {
  }
}

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function down(db) {
  try {
    await db.schema
    .alterTable('auth_users')
    .dropColumn('firstname')
    .execute();
  
    await db.schema
    .alterTable('auth_users')
    .dropColumn('lastname')
    .execute();
  } catch (e) {
  }
}