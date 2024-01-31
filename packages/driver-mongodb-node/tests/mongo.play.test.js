import 'dotenv/config';
import { MongoClient, ServerApiVersion } from 'mongodb';
import * as path from 'node:path';
import { fileURLToPath } from "node:url";

import { test } from 'uvu';
import * as assert from 'uvu/assert';

const uri = process.env.MONGODB_URI;

let client = new MongoClient(
  uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  }
);

test.before(async () => await client.connect())
test.after(async () => await client.close());

test('basic connect', async () => {
  console.log(process.cwd())


  await client.db('main').collection('test').updateMany(
    {
      tags: 'b'
    },
    {
      $pull: { tags: 'b' },
      // $addToSet: { tags: 'ccc' },
    }
  )

});

test.run()
