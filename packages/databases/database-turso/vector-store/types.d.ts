
import type { AIEmbedder } from '@storecraft/core/ai';
export { LibSQLVectorStore, DEFAULT_INDEX_NAME } from './index.js';

export type Config = {
  /** 
   * @description The database URL.
   *
   * The client supports `libsql:`, `http:`/`https:`, `ws:`/`wss:` and `file:` URL. For more infomation,
   * please refer to the project README:
   *
   * https://github.com/libsql/libsql-client-ts#supported-urls
   * 
   * If missing, it will be inferred by env variable `LIBSQL_VECTOR_URL` or `LIBSQL_URL`,
   * or will settle to `file:data.db` if none are set.
   */
  url?: string;
  /** 
   * @description Authentication token for the database. Not applicable for local `url`=`file:local.db`.
   * 
   * If missing, it will be inferred by env variable `LIBSQL_VECTOR_AUTH_TOKEN` or `LIBSQL_AUTH_TOKEN`
   * 
   * @default ENV variable `LIBSQL_AUTH_TOKEN`
   */
  authToken?: string;

  /**
   * @description The name of the index
   * @default 'vector_store'
   */
  index_name?: string,

  /** 
   * @description The dimensions of the vectors to be inserted in the index. 
   * @default 1536
   */
  dimensions?: number,

  /**
   * @description The similiarity metric
   * @default 'cosine'
   */
  similarity?: 'euclidean' | 'cosine',

   /**
   * @description Embedding model provider
   */
   embedder: AIEmbedder
}
