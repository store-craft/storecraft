export { OpenAIEmbedder } from './index.js';

export type config = {
  model?: ('@cf/baai/bge-base-en-v1.5' | '@cf/baai/bge-large-en-v1.5' | '@cf/baai/bge-small-en-v1.5') | ({} & string),
  account_id: string;
  api_key: string;
  cf_email: string,
}

export type RequestBody = {
  text: string | string[]
}

export type RequestResult = {
  shape:  number[],
  data: number[][];
};
