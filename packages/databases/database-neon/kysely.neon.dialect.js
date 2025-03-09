/**
 * @import { NeonServerlessConfig } from './types.public.js';
 * @import { 
 *  Dialect, Driver, DatabaseConnection, 
 *  TransactionSettings,QueryResult 
 * } from 'kysely';
 * @import { PoolClient, NeonQueryFunction } from '@neondatabase/serverless';
 */
import {
  CompiledQuery,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely"
import {
  Pool,
  neonConfig,
} from "@neondatabase/serverless"

/**
 * @implements {Dialect}
 */
export class NeonServerlessDialect {

  /**
   * 
   * @param {NeonServerlessConfig} config 
   */
  constructor(config) {
    this.config = config
  }

  createAdapter() { return new PostgresAdapter() }
  createDriver() { return new NeonDriver(this.config) }
  createQueryCompiler() { return new PostgresQueryCompiler() }
  createIntrospector(db) { return new PostgresIntrospector(db) }
}


/**
 * @implements {Driver}
 */
class NeonDriver {
  /** @type {WeakMap<PoolClient, NeonConnection>} */
  #connections = new WeakMap()
  /** @type {Pool} */
  #pool;

  /**
   * @param {NeonServerlessConfig} config
   */
  constructor(config) {
    this.config = config
  }

  async init() {
    neonConfig.webSocketConstructor = WebSocket;
    Object.assign(neonConfig, this.config.neonConfig);
    this.#pool = new Pool(this.config.poolConfig);
  }

  async acquireConnection() {
    const client = await this.#pool?.connect()
    let connection = this.#connections.get(client)

    if (!connection) {
      connection = new NeonConnection(client)
      this.#connections.set(client, connection)
    }

    return connection
  }

  /**
   * 
   * @param {NeonConnection} conn 
   * @param {TransactionSettings} settings 
   */
  async beginTransaction(conn, settings) {
    if (settings.isolationLevel) {
      await conn.executeQuery(
        CompiledQuery.raw(
          `start transaction isolation level ${settings.isolationLevel}`
        )
      )
    } else {
      await conn.executeQuery(CompiledQuery.raw("begin"))
    }
  }

  /**
   * @param {NeonConnection} conn 
   */
  async commitTransaction(conn) {
    await conn.executeQuery(CompiledQuery.raw("commit"))
  }

  /**
   * @param {NeonConnection} conn 
   */
  async rollbackTransaction(conn) {
    await conn.executeQuery(CompiledQuery.raw("rollback"))
  }

  /**
   * @param {NeonConnection} conn 
   */
  async releaseConnection(conn) {
    conn[PRIVATE_RELEASE_METHOD]()
  }

  async destroy() {
    if (this.#pool) {
      const pool = this.#pool
      this.#pool = undefined
      await pool.end()
    }
  }
}



/**
 * @typedef {object} Client
 * @prop {NeonQueryFunction} query
 * @prop {() => void} [release]
 */

export const PRIVATE_RELEASE_METHOD = Symbol("release")

/**
 * @implements {DatabaseConnection}
 */
export class NeonConnection {

  /**
   * 
   * @param {PoolClient} client 
   */
  constructor(client) {
    this.client = client
  }

  /**
   * @template R result type
   * 
   * @param {CompiledQuery} compiledQuery 
   * 
   * @returns {Promise<QueryResult<R>>}
   */
  async executeQuery(compiledQuery) {
    
    const result = await this.client.query(
      compiledQuery.sql, 
      [
        ...compiledQuery.parameters,
      ]
    );

    if (
      result.command === "INSERT" ||
      result.command === "UPDATE" ||
      result.command === "DELETE"
    ) {
      const numAffectedRows = BigInt(result.rowCount)

      return {
        // TODO: remove.
        numUpdatedOrDeletedRows: numAffectedRows,
        numAffectedRows,
        rows: result.rows ?? [],
      }
    }

    return {
      rows: result.rows ?? [],
    }
  }

  /**
   * @template R result type
   * 
   * @param {CompiledQuery} compiledQuery 
   * @param {number} chunkSize 
   * 
   * @returns {AsyncIterableIterator<QueryResult<R>>}
   */
  async *streamQuery(compiledQuery, chunkSize) {
    throw new Error("Neon Driver does not support streaming")
  }

  [PRIVATE_RELEASE_METHOD]() {
    this.client.release?.()
  }
}