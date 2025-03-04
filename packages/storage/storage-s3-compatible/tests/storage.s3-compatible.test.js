import 'dotenv/config';
import { S3CompatibleStorage } from '@storecraft/storage-s3-compatible'
import { storage as storage_test_runner } from '@storecraft/core/test-runner'

const FORCE_PATH_STYLE = true;

const storage = new S3CompatibleStorage(
  {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET,
    endpoint: process.env.ENDPOINT,
    forcePathStyle: FORCE_PATH_STYLE,
    // @ts-ignore
    region: process.env.S3_REGION
  }
);

const suite = storage_test_runner.create(storage);

suite.before(async () => { await storage.init(undefined) });

suite.run();
