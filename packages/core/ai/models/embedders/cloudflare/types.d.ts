export * from './index.js';

export type config = {
  /**
   * @description The embedding model
   * @default '@cf/baai/bge-large-en-v1.5'
   */
  model?: ('@cf/baai/bge-base-en-v1.5' | '@cf/baai/bge-large-en-v1.5' | '@cf/baai/bge-small-en-v1.5') | ({} & string),

  /** If absent, will be infered from environment variable `CF_ACCOUNT_ID` */
  account_id?: string;

  /** If absent, will be infered from environment variable `CF_AI_API_KEY` and then `CF_API_KEY` */
  api_key?: string;

  /** If absent, will be infered from environment variable `CF_EMAIL` */
  cf_email?: string,
}

export type RequestBody = {
  text: string | string[]
}

export type RequestResult = {
  shape:  number[],
  data: number[][];
};
