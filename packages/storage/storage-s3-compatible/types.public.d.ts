export { DigitalOceanSpaces, R2, S3, S3CompatibleStorage } from './adapter.js';

export type Config = {
  /** Optional, complete endpoint if you know it in advance */
  endpoint?: string;
  /** If missing, will be inferred by env variable `S3_BUCKET` */
  bucket?: string;
  /** If missing, will be inferred by env variable `S3_ACCESS_KEY_ID` */
  accessKeyId?: string;
  /** If missing, will be inferred by env variable `S3_SECRET_ACCESS_KEY` */
  secretAccessKey?: string;
  /** If missing, will be inferred by env variable `S3_REGION` */
  region?: 'auto' | string;
  forcePathStyle?: boolean;
}

export type R2Config = Omit<Config, 'region' | 'forcePathStyle' | 'endpoint'> & {
  /**
   * @description cloudflare account id. If missing will be inferred by env variable `CF_ACCOUNT_ID`
   */
  account_id?: string;
};


export type AwsS3Config = Omit<Config, 'endpoint'> & {
  region?: AWSRegion;
};

export type AWSRegion = 
  | "us-east-1"
  | "us-east-2"
  | "us-west-1"
  | "us-west-2"
  | "af-south-1"
  | "ap-east-1"
  | "ap-south-1"
  | "ap-south-2"
  | "ap-southeast-1"
  | "ap-southeast-2"
  | "ap-southeast-3"
  | "ap-northeast-1"
  | "ap-northeast-2"
  | "ap-northeast-3"
  | "ca-central-1"
  | "ca-west-1"
  | "eu-central-1"
  | "eu-central-2"
  | "eu-west-1"
  | "eu-west-2"
  | "eu-west-3"
  | "eu-north-1"
  | "eu-south-1"
  | "eu-south-2"
  | "me-central-1"
  | "me-south-1"
  | "sa-east-1"
  | "us-gov-east-1"
  | "us-gov-west-1"
  | "cn-north-1"
  | "cn-northwest-1";