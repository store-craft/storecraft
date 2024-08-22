export { DigitalOceanSpaces, R2, S3, S3CompatibleStorage } from './index.js';

export type Config = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  forcePathStyle: boolean;
}

export type R2Config = Omit<Config, 'region' | 'forcePathStyle' | 'endpoint'> & {
  /**
   * @description cloudflare account id
   */
  account_id: string;
};


export type AwsS3Config = Omit<Config, 'endpoint'>;

