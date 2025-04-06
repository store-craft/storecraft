import { Db, MongoClient } from 'mongodb';
import { MongoDB } from '../index.js'
import { 
  templates as templates_corrections 
} from '@storecraft/core/assets/seed-templates-v3-update-previous-templates-with-subject.js';

/**
 * 
 * @param {Db} db 
 * @param {MongoClient} client 
 */
export async function up(db, client) {

  const session = client.startSession();
  try {
    await session.withTransaction(
      async (s) => {
        /** @type {MongoDB} */
        // @ts-ignore
        const driver = client.__db_driver;

        for (const template of templates_corrections) {
          await driver.resources.templates._col.updateOne(
            { id: template.id },
            {
              $set: {
                template_subject: template.template_subject,
              },
            },
            { session, upsert: false } 
          );
        }
      }
    );
  } finally {
    await session.endSession();
  }
}

/**
 * 
 * @param {Db} db 
 * @param {MongoClient} client 
 */
export async function down(db, client) {
}
