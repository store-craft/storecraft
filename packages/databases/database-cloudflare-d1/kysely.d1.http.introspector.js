/**
 * @import {DatabaseIntrospector, Kysely} from "kysely";
 */
import { DEFAULT_MIGRATION_LOCK_TABLE, DEFAULT_MIGRATION_TABLE, sql } from "kysely";

/** 
 * This is a custom introspector for the D1 database.
 * Thre reason we did not use the regular SqliteIntrospector is that, `d1` will
 * raise `SQLITE_AUTH` for querying pragma tables with a reference, which is what
 * the normal SqliteIntrospector does.
 * 
 * @implements {DatabaseIntrospector} 
 */
export class D1Introspector {

  /** @type {Kysely} */
  #db;

  /**
   * 
   * @param {Kysely} db 
   */
  constructor(db) {
      this.#db = db;
  }
  

  /** @type {DatabaseIntrospector["getSchemas"]} */
  async getSchemas() {
    // Sqlite doesn't support schemas.
    return [];
  }

  /** @type {DatabaseIntrospector["getTables"]} */
  async getTables(options = { withInternalKyselyTables: false }) {
    let query = this.#db
      .selectFrom('sqlite_master')
      .where('type', 'in', ['table', 'view'])
      .where('name', 'not like', 'sqlite_%')
      .select('name')
      .orderBy('name')
      .$castTo();
    if (!options.withInternalKyselyTables) {
      query = query
        .where('name', '!=', DEFAULT_MIGRATION_TABLE)
        .where('name', '!=', DEFAULT_MIGRATION_LOCK_TABLE);
    }
    const tables = await query.execute();
    return Promise.all(tables.map(({ name }) => this.#getTableMetadata(name)));
  }

  /** @type {DatabaseIntrospector["getMetadata"]} */
  async getMetadata(options) {
    return {
      tables: await this.getTables(options),
    };
  }

  /**
   * @param {string} table 
   */
  async #getTableMetadata(table) {
    const db = this.#db;
    // Get the SQL that was used to create the table.
    const tableDefinition = await db
      .selectFrom('sqlite_master')
      .where('name', '=', table)
      .select(['sql', 'type'])
      .$castTo()
      .executeTakeFirstOrThrow();
    // Try to find the name of the column that has `autoincrement` 🤦
    const autoIncrementCol = tableDefinition.sql
      ?.split(/[\(\),]/)
      ?.find((it) => it.toLowerCase().includes('autoincrement'))
      ?.trimStart()
      ?.split(/\s+/)?.[0]
      ?.replace(/["`]/g, '');
    const columns = await db
      .selectFrom(sql `pragma_table_info(${table})`.as('table_info'))
      .select(['name', 'type', 'notnull', 'dflt_value'])
      .orderBy('cid')
      .execute();
    return {
      name: table,
      isView: tableDefinition.type === 'view',
      columns: columns.map((col) => ({
        name: col.name,
        dataType: col.type,
        isNullable: !col.notnull,
        isAutoIncrementing: col.name === autoIncrementCol,
        hasDefaultValue: col.dflt_value != null,
        comment: undefined,
      })),
    };
  }
}
