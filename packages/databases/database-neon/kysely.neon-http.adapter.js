/**
 * @import { MigrationLockOptions } from 'kysely';
 */
import { DialectAdapterBase, Kysely, sql } from "kysely"

// Random id for our transaction lock.
const LOCK_ID = BigInt('3853314791062309107')

/**
 * @description `neon` over http does not support transactional `ddl`.
 * The entire dialect defers executions of transactions into a batch, 
 * therefore it will hinder `kysely`'s main migrator if `supportsTransactionalDdl()==true`
 * 
 */
export class NeonHttpAdapter extends DialectAdapterBase{
  constructor() {
    super();
  }

  get supportsTransactionalDdl() {
    return false;
  }

  get supportsReturning(){
    return true
  }

  /**
   * 
   * @param {Kysely<any>} db 
   * @param {MigrationLockOptions} _opt 
   */
  async acquireMigrationLock(db, _opt) {
    // Acquire a transaction level advisory lock.
    // await sql`select pg_advisory_xact_lock(${sql.lit(LOCK_ID)})`.execute(db)
    await sql`select pg_advisory_lock(${sql.lit(LOCK_ID)})`.execute(db)
  }

  /**
   * 
   * @param {Kysely<any>} db 
   * @param {MigrationLockOptions} _opt 
   */
  async releaseMigrationLock(db, _opt) {
    await sql`select pg_advisory_unlock(${sql.lit(LOCK_ID)})`.execute(db)

    // Nothing to do here. `pg_advisory_xact_lock` is automatically released at the
    // end of the transaction and since `supportsTransactionalDdl` true, we know
    // the `db` instance passed to acquireMigrationLock is actually a transaction.
  }
}