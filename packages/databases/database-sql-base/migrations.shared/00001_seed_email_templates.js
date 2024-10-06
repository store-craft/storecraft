import { Kysely } from 'kysely'
import { upsert } from '../src/con.templates.js'
import { templates } from '@storecraft/core/assets/seed-templates.js';

/**
 * @typedef {import('../types.sql.tables.js').Database} Database
 */

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function up(db) {
  
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
