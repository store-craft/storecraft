import 'dotenv/config';
import { S3CompatibleStorage } from '@storecraft/storage-s3-compatible'
import { storage as storage_test_runner } from '@storecraft/core/test-runner'

const FORCE_PATH_STYLE = true;

const storage = new S3CompatibleStorage(
  {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    bucket: process.env.BUCKET,
    endpoint: process.env.ENDPOINT,
    forcePathStyle: FORCE_PATH_STYLE,
    region: undefined
  }
);

const suite = storage_test_runner.create(storage);

suite.before(async () => { await storage.init(undefined) });

suite.run();
