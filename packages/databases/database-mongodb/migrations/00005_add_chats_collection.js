import { Db, MongoClient } from 'mongodb';

const collections = [
  'chats'
];

/**
 * @param {Db} db 
 * @param {MongoClient} client 
 */
export async function up(db, client) {

  const session = client.startSession();
  try {
    await session.withTransaction(async ($session) => {
      for (const collection_name of collections) {

        await db.createCollection(collection_name, {session: $session})
        await db.collection(collection_name).dropIndexes({ session: $session });

        await db.collection(collection_name).createIndexes(
          [
            {
              key: { handle: 1 }, name: 'handle+', 
              background: false, unique: true, sparse: true
            }, 
            {
              key: { updated_at: 1, _id: 1 }, name: '(updated_at+, _id+)', 
              background: false, sparse: true
            }, 
            {
              key: { updated_at: -1, _id: -1 }, name: '(updated_at-, _id-)', 
              background: false, sparse: true
            }, 
            {
              key: { search: 1 }, name: '(search+)', 
              background: false, sparse: true
            }, 
          ], {
            session: $session
          }
        )
      }

    });
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