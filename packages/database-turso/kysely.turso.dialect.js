import * as libsql from "@libsql/client";
import * as kysely from "kysely";

/**
 * @typedef {import('kysely').Driver} Driver
 * @typedef {import('kysely').Dialect} Dialect
 * @typedef {import('kysely').DatabaseConnection} DatabaseConnection
 * @typedef {import('./types.public.d.ts').Config} Config
 */

/**
 * 
 * @implements {Dialect}
 */
export class LibsqlDialect {
  /** @type {Config} */    
  #config;

  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.#config = config;
  }

  createAdapter() { return new kysely.SqliteAdapter(); }
  createQueryCompiler() { return new kysely.SqliteQueryCompiler(); }
  createDriver() {

    if (this.#config?.libsqlConfig?.url===undefined) {
      throw new Error(
        "Please specify either `client` or `url` in the LibsqlDialect config"
      );
    }

    return new LibsqlDriver(
      libsql.createClient(this.#config.libsqlConfig), 
      this.#config
    );
  }

  /** @type {Dialect["createIntrospector"]} */
  createIntrospector(db) {
    return new kysely.SqliteIntrospector(db);
  }

}

/**
 * 
 * @implements {Driver}
 */
export class LibsqlDriver {
  /** @type {libsql.Client} */
  client;

  /**
   * @param {libsql.Client} client 
   * @param {Config} config 
   */
  constructor(client, config) {
    this.client = client;
    this.config = config;
  }

  async init() {}

  async acquireConnection() {
    return new LibsqlConnection(this.client, this.config);
  }

  /**
   * 
   * @param {LibsqlConnection} connection 
   * @param {kysely.TransactionSettings} settings 
   */
  async beginTransaction(connection, settings) {
    await connection.beginTransaction();
  }

  /**
   * 
   * @param {LibsqlConnection} connection 
   */
  async commitTransaction(connection) {
    await connection.commitTransaction();
  }

  /**
   * 
   * @param {LibsqlConnection} connection 
   */
  async rollbackTransaction(connection) {
    await connection.rollbackTransaction();
  }

  /**
   * 
   * @param {LibsqlConnection} _conn 
   */
  async releaseConnection(_conn) {}

  async destroy() {
    this.client.close();
  }
}

/**
 * @implements {DatabaseConnection}
 */
export class LibsqlConnection {
  /** @type {libsql.Client} */
  client;
  /** @type {Config} */
  config;
  isBatch = false;
  /** @type {kysely.CompiledQuery[]} */
  batch = []

  /** @type {libsql.Transaction} */
  #transaction;

  /**
   * 
   * @param {libsql.Client} client 
   * @param {Config} config 
   */
  constructor(client, config) {
    this.client = client;
    this.config = config;
  }

  /**
   * @param {kysely.CompiledQuery[]} compiledQueries 
   * 
   * @returns {Promise<import('kysely').QueryResult<import("@libsql/client").Row>>}
   */
  async #internal_executeQuery(compiledQueries) {
    const target = this.#transaction ?? this.client;

    const stmts = compiledQueries.map(
      cq => (
        {
          sql: cq.sql,
          args: (/** @type {import("@libsql/client").InArgs} */ (cq.parameters)),
        }
      )
    );

    const results = await target.batch(
      stmts  
    );

    // console.log('q', JSON.stringify({sql, params}, null, 2))
    console.log('stmts', JSON.stringify(stmts, null, 2))
    console.log('result', JSON.stringify(results, null, 2))

    const last_result = results?.at(-1);

    return {
      insertId: last_result?.lastInsertRowid,
      rows: last_result?.rows ?? [],
      numAffectedRows: BigInt(last_result?.rowsAffected ?? 0),
      // @ts-ignore deprecated in kysely >= 0.23, keep for backward compatibility.
      numUpdatedOrDeletedRows: last_result?.rowsAffected,
    };

  } 

  /**
   * 
   * @param {kysely.CompiledQuery} compiledQuery 
   * 
   * @returns {Promise<import('kysely').QueryResult>}
   */
  async executeQuery(compiledQuery) {
    console.log('this.isBatch', this.isBatch)
    if(this.isBatch) {
      this.batch.push(compiledQuery);
      return Promise.resolve(
        {
          rows: []
        }
      )
    } else {
      return this.#internal_executeQuery([compiledQuery]);
    }
  }

  async beginTransaction() {
    if(this.config.prefers_batch_over_transactions) {
      this.isBatch = true;
      this.batch = [];
      return;
    }

    if (this.#transaction) {
      throw new Error("Transaction already in progress");
    }
    this.#transaction = await this.client.transaction();
  }

  async commitTransaction() {
    console.log('commitTransaction')
    if(this.isBatch) {
      // console.trace()
      await this.#internal_executeQuery(this.batch);
      this.isBatch = false;
      this.batch = [];
      return;
    }

    if (!this.#transaction) {
      throw new Error("No transaction to commit");
    }
    await this.#transaction.commit();
    this.#transaction = undefined;
  }

  async rollbackTransaction() {
    if(this.isBatch) {
      this.isBatch = false;
      this.batch = [];
      return;
    }

    if (!this.#transaction) {
      throw new Error("No transaction to rollback");
    }
    await this.#transaction.rollback();
    this.#transaction = undefined;
  }
  /**
   * @template R result type
   * 
   * @param {kysely.CompiledQuery} compiledQuery 
   * @param {number} chunkSize 
   * 
   * @returns {AsyncIterableIterator<import('kysely').QueryResult<R>>}
   */
  async *streamQuery(compiledQuery, chunkSize) {
    throw new Error("Libsql Driver does not support streaming yet");
  }

}