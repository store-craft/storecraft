import 'dotenv/config';
import { Client } from '../d1/api.js';
import sql from 'better-sqlite3'

const test = async () => {

  const client = new Client(
    process.env.CLOUDFLARE_ACCOUNT_ID, 
    process.env.CLOUDFLARE_D1_DATABASE_ID, 
    process.env.CLOUDFLARE_D1_API_TOKEN
  );
  
  // client.list()
  //   .then(json => console.log(json))
  //   .catch(err => console.error('error:' + err));  

  const result = await client.query(
    // {
    //   sql: 'select * from TTT WHERE name = "11"',
    //   // params: ['1', '2']
    // }
    {
      "sql": "select \"name\", \"type\", \"notnull\", \"dflt_value\" from pragma_table_info(?) as \"table_info\" order by \"cid\"",
      "params": [
        "_cf_KV"
      ]
    }
  )

  // const result2 = await client.list()

  console.log(JSON.stringify(result, null, 2))
  // console.log(JSON.stringify(result2, null, 2))

}

const test2 = async () => {
  const db = sql(':memory')
  const row = db.prepare('SELECT * FROM users WHERE id = ?').bind('userId');
  console.log(row);
}

test()
// test2()

/**
 * 
 * @param {string} stmt 
 * @param {any[] | Record<string, any>} params 
 */
const prepare_and_bind = (stmt, params) => {
  const params_object = Array.isArray(params) ? 
      params.reduce((a, v, idx) => ({ ...a, [idx+1]: v}), {}) : 
      params; 

  let current = 0;
  let result = ''
  let index_run = 1;
  for (let m of stmt.matchAll(/\?[0-9]*/g)) {
    result += stmt.slice(current, m.index);
  
    const match_string = m[0];
    let index_access = match_string.length > 1 ? 
          Number(match_string.slice(1)) : 
          index_run;
  
    result += '"' + params_object[index_access] + '"';
  
    current = m.index + m[0].length;
    index_run+=1;
  }
  
  result += stmt.slice(current);

  return result;
}

const stmt = 'hello ? d ? dsd ? hello'
const params = [1,2,3,4, 5];


console.log(stmt)
console.log(params)
console.log(prepare_and_bind(stmt, params))