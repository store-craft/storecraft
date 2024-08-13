import {connect, Connection} from '@planetscale/database'
import {
  CompiledQuery,
  Kysely,
  MysqlAdapter,
  MysqlIntrospector,
  MysqlQueryCompiler,
} from 'kysely'

/**
 * @typedef {import('kysely').Dialect} Dialect
 * @typedef {import('kysely').Driver} Driver
 * @typedef {import('kysely').DatabaseConnection} DatabaseConnection
 * @typedef {import('kysely').DatabaseIntrospector} DatabaseIntrospector
 * @typedef {import('./types.public.js').PlanetScaleDialectConfig} PlanetScaleDialectConfig
 */

/**
 * PlanetScale dialect that uses the [PlanetScale Serverless Driver for JavaScript][0].
 * The constructor takes an instance of {@link Config} from `@planetscale/database`.
 *
 * ```typescript
 * new PlanetScaleDialect({
 *   host: '<host>',
 *   username: '<username>',
 *   password: '<password>',
 * })
 *
 * // or with a connection URL
 *
 * new PlanetScaleDialect({
 *   url: process.env.DATABASE_URL ?? 'mysql://<username>:<password>@<host>/<database>'
 * })
 * ```
 *
 * See the [`@planetscale/database` documentation][1] for more information.
 *
 * [0]: https://github.com/planetscale/database-js
 * [1]: https://github.com/planetscale/database-js#readme
 * 
 * @implements {Dialect}
 */
export class PlanetScaleDialect {

  /**
   * @param {PlanetScaleDialectConfig} config 
   */
  constructor(config) {
    this.config = config
  }

  createAdapter() { return new MysqlAdapter() }
  createDriver() { return new PlanetScaleDriver(this.config) }
  createQueryCompiler() { return new MysqlQueryCompiler() }
  /** @type {Dialect["createIntrospector"]} */
  createIntrospector(db) { return new MysqlIntrospector(db) }
}

/**
 * @implements {Driver}
 */
class PlanetScaleDriver {

  /**
   * @param {PlanetScaleDialectConfig} config 
   */
  constructor(config) {
    this.config = config
  }

  async init() {}

  async acquireConnection(){
    return new PlanetScaleConnection(this.config)
  }

  /**
   * @param {PlanetScaleConnection} conn 
   */
  async beginTransaction(conn) {
    return await conn.beginTransaction()
  }

  /**
   * @param {PlanetScaleConnection} conn 
   */
  async commitTransaction(conn) {
    return await conn.commitTransaction()
  }

  /**
   * @param {PlanetScaleConnection} conn 
   */
  async rollbackTransaction(conn) {
    return await conn.rollbackTransaction()
  }

  /**
   * @param {PlanetScaleConnection} _conn 
   */
  async releaseConnection(_conn) {}

  async destroy() {}
}


/** @type {WeakMap<PlanetScaleDialectConfig, Connection>} */
const sharedConnections = new WeakMap()


/**
 * @implements {DatabaseConnection}
 */
class PlanetScaleConnection {
  /** @type {Connection} */
  #conn;
  /** @type {PlanetScaleConnection} */
  #transactionClient; 

  /**
   * 
   * @param {PlanetScaleDialectConfig} config 
   * @param {boolean} [isForTransaction=false] 
   */
  constructor(config, isForTransaction = false) {
    this.config = config;

    const useSharedConnection = config.useSharedConnection && !isForTransaction;
    const sharedConnection = useSharedConnection ? sharedConnections.get(config) : undefined;

    this.#conn = sharedConnection ?? connect({...config});

    if (useSharedConnection) 
      sharedConnections.set(config, this.#conn);
  }

  /**
   * @template R result type
   * 
   * @param {CompiledQuery} compiledQuery 
   * 
   * @returns {Promise<import('kysely').QueryResult<R>>}
   */
  async executeQuery(compiledQuery) {
    if (this.#transactionClient) 
      return this.#transactionClient.executeQuery(compiledQuery);

    // If no custom formatter is provided, format dates as DB date strings
    const parameters = compiledQuery.parameters;
    const results = await this.#conn.execute(
      compiledQuery.sql, parameters
    );

    // @planetscale/database versions older than 1.3.0 return errors directly, rather than throwing
    if (( /** @type {any} */ (results))?.error) {
      throw ( /** @type {any} */ (results))?.error;
    }

    const numAffectedRows = (results.rowsAffected == null) ? 
        undefined : BigInt(results.rowsAffected);
    const insertId = (results.insertId !== null && results.insertId.toString() !== '0') ? 
        BigInt(results.insertId) : undefined;

    return {
      insertId,
      rows: ( /** @type {R[]} */ (results.rows)),
      // @ts-ignore replaces `QueryResult.numUpdatedOrDeletedRows` in kysely > 0.22
      // following https://github.com/koskimas/kysely/pull/188
      numAffectedRows,
      // deprecated in kysely > 0.22, keep for backward compatibility.
      numUpdatedOrDeletedRows: numAffectedRows,
    }
  }

  async beginTransaction() {
    this.#transactionClient = this.#transactionClient ?? new PlanetScaleConnection(this.config, true);
    await this.#transactionClient.#conn.execute('BEGIN');
  }

  async commitTransaction() {
    if (!this.#transactionClient) throw new Error('No transaction to commit')
    try {
      await this.#transactionClient.#conn.execute('COMMIT')
    } finally {
      this.#transactionClient = undefined
    }
  }

  async rollbackTransaction() {
    if (!this.#transactionClient) throw new Error('No transaction to rollback')
    try {
      await this.#transactionClient.#conn.execute('ROLLBACK')
    } finally {
      this.#transactionClient = undefined
    }
  }

  /**
   * @template R result type
   * 
   * @param {CompiledQuery} _compiledQuery 
   * @param {number} _chunkSize 
   * 
   * @returns {AsyncIterableIterator<import('kysely').QueryResult<R>>}
   */
  async *streamQuery(_compiledQuery, _chunkSize) {
    throw new Error('PlanetScale Serverless Driver does not support streaming')
  }
}
