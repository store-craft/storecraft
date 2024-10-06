import { Db, MongoClient } from 'mongodb';
import { MongoDB } from '../index.js'
import { templates } from '@storecraft/core/v-assets/seed-templates.js'

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
        const driver = client.__db_driver;

        for (const template of templates) {
          await driver.resources.templates.upsert(template, template.search);
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
