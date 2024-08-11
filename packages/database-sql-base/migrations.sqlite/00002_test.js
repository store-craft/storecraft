import { Kysely } from 'kysely'

/**
 * @typedef {import('../types.sql.tables.js').Database} Database
 */

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function up(db) {
  
    await db.schema
        .createTable('test_1')
        .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
        .addColumn('owner_id', 'integer')
        .execute()
}

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function down(db) {
}

