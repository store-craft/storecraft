/**
 * @import { Database } from '../types.sql.tables.js'
 */
import { Kysely } from 'kysely'
import { 
  templates as templates_corrections 
} from '@storecraft/core/assets/seed-templates-v3-update-previous-templates-with-subject.js';

/**
 * update templates with subject template
 * @param {Kysely<Database>} db 
 */
export async function up(db) {
  await db.schema
  .alterTable('templates')
  .addColumn('template_subject', 'text')
  .execute();

  for (const template of templates_corrections) {
    await db
    .updateTable('templates')
    .set({
      template_subject: template.template_subject,
    })
    .where('id', '=', template.id)
    .executeTakeFirst();
  }
}

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function down(db) {
  await db.schema
  .alterTable('templates')
  .dropColumn('template_subject')
  .execute();
}