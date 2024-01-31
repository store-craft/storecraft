import 'dotenv/config'
import { MongoClient, ServerApiVersion } from 'mongodb';

import { test } from 'uvu';
import * as assert from 'uvu/assert';

const uri = process.env.MONGODB_URI;

console.log('uri ', uri);

const client = new MongoClient(
  uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  }
);

test('basic connect', async () => {
  // Connect the client to the server	(optional starting in v4.7)
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("test").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
  // Ensures that the client will close when you finish/error
  await client.close();

  // assert.is(res2.verified, false);
});


test.run();