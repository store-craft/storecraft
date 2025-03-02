export * from './index.js';

export type Config = {
  api_key: string;
  /** This is a `url` where you should query the index, get it from the console | describe api call */
  index_host: string,
}