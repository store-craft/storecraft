export { DigitalOceanSpaces, R2, S3, S3CompatibleStorage } from './index.js';

export type Config = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  forcePathStyle: boolean;
}

