/**
 * @import { Database } from '../types.sql.tables.js'
 */
import { Kysely } from 'kysely'
import { 
  add_base_columns, create_base_indexes, 
  create_safe_table, drop_safe_table
} from './00000_init_tables.js';

/**
 * @param {Kysely<Database>} db 
 */
export async function up(db) {

  let tb = create_safe_table(db, 'chats');
  tb = add_base_columns(tb);
  tb = tb
    .addColumn('customer_id', 'text')
    .addColumn('customer_email', 'text')
    .addColumn('extra', 'json')
  await tb.execute();
  await create_base_indexes(db, 'chats');

}

/**
 * @param {Kysely<Database>} db 
 */
export async function down(db) {
  await drop_safe_table(db, 'chats');
}