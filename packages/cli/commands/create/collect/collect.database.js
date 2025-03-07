/**
 * @import { Choice } from '../../utils.js';
 */
import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text, 
} from '@clack/prompts';
import { required, withCancel } from './collect.utils.js';

/** @satisfies {Choice[]} */
export const choices = /** @type {const} */ ([
  {
    name: 'sqlite (with libsql)',
    value: 'libsql-local',
    description: 'Local SQLite database (Recommended)'
  },
  {
    name: 'sqlite (with better-sqlite3)',
    value: 'sqlite',
  },
  {
    name: 'postgres',
    value: 'postgres',
  },
  {
    name: 'mysql',
    value: 'mysql',
  },
  {
    name: 'mongo',
    value: 'mongo_db',
  },
  {
    name: 'Turso (Cloud libsql)',
    value: 'turso',
    description: 'Cloud SQLite database'
  },
  {
    name: 'Cloudflare D1 (Cloud sqlite)',
    value: 'd1',
    description: 'Cloud SQLite database'
  },
  {
    name: 'Neon (http)',
    value: 'neon_http',
    description: 'Cloud Postgres, http driver'
  },
  {
    name: 'Neon (web sockets and pool)',
    value: 'neon_ws',
    description: 'Cloud Postgres, Websocket driver'
  },
  {
    name: 'PlanetScale',
    value: 'planetscale',
    description: 'Cloud MySql'
  },
]);


export const collect_database = async () => {

  const id = await withCancel(
    select(
      {
        message: '💾 Select a database',
        options: choices.map(
          c => (
            {
              value: c.value,
              label: c.name
            }
          )
        )
      }
    )
  );

  return {
    type: 'database',
    id: id,
    config: await collect_general_config(id)
  };
}

/**
 * 
 * @param {choices[number]["value"]} id 
 * @returns 
 */
const collect_general_config = async (
  id
) => {
  switch(id) {
    case 'sqlite': {
      /** @type {import('@storecraft/database-sqlite').Config} */
      const config = {
        options: {},
        filepath: await withCancel(
          text(
            { 
              message: 'Sqlite local file name',
              defaultValue: 'data.db',
              placeholder: 'data.db',
            }
          )
        ) 
      }
      return config;
    }
    case "postgres": {
      /** @type {import('@storecraft/database-postgres').Config} */
      const config = {
        pool_config: {
          host: await withCancel(
            text(
              { 
                message: 'Postgres host',
                defaultValue: 'localhost',
                placeholder: 'localhost'
              }
            ),
          ),
          port: parseInt(
            await withCancel(
              text(
                { 
                  message: 'Postgres port',
                  defaultValue: '6432',
                  placeholder: '6432',
                }
              )
            )
          ),
          user: await withCancel(
            text(
              { 
                message: 'Postgres user',
                defaultValue: 'admin',
                placeholder: 'admin',
              }
            )
          ),
          password: await withCancel(
            text(
              { 
                message: 'Postgres password',
                defaultValue: 'admin',
                placeholder: 'admin',
              }
            ),
          )
        }
      }
      return config;
    }
    case "mysql": {
      /** @type {import('@storecraft/database-mysql').Config} */
      const config = {
        pool_options: {
          database: await withCancel(
            text(
              { 
                message: 'MySQL database name',
                defaultValue: 'main',
                placeholder: 'main',
              }
            ),
          ),
          host: await withCancel(
            text(
              { 
                message: 'MySQL database host',
                defaultValue: 'localhost',
                placeholder: 'localhost',
              }
            ),
          ),
          port: parseInt(
            await withCancel(
              text(
                { 
                  message: 'MySQL database port',
                  defaultValue: '8080',
                  placeholder: '8080',
                }
              )
            ),
          ),
          user: await withCancel(
            text(
              { 
                message: 'MySQL user name',
                defaultValue: 'admin',
                placeholder: 'admin',
              }
            ),
          ),
          password: await withCancel(
            text(
              { 
                message: 'MySQL user password',
                defaultValue: 'admin',
                placeholder: 'admin',
              }
            ),
          )
        }
      }
      return config;
    }
    case "mongo_db": {
      /** @type {import('@storecraft/database-mongodb').Config} */
      const config = {
        url: await withCancel(
          text(
            { 
              message: 'MongoDB connection url',
              validate: required,
            }
          ),
        ),
        db_name: await withCancel(
          text(
            { 
              message: 'MongoDB Database name',
              defaultValue: 'test',
              placeholder: 'test',
            }
          )
        )
      }
      return config;
    }

    case "libsql-local": {
      /** @type {import('@storecraft/database-turso').Config} */
      let config = {
        url: 'file:' + await withCancel(
          text(
            { 
              message: 'Sqlite local file name',
              defaultValue: 'data.db',
              placeholder: 'data.db',
            }
          ),
        )
      }
      return config;
    }

    case "turso": {
      /** @type {import('@storecraft/database-turso').Config} */
      let config = {
        url: await withCancel(
          text(
            { 
              message: 'Turso connection url',
              validate: required,
            }
          ),
        ),
        authToken: await withCancel(
          text(
            { 
              message: 'Turso auth token',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        )
      }
      return config;
    }

    case "d1": {
      /** @type {import('@storecraft/database-cloudflare-d1').D1ConfigHTTP} */
      let config = {
        account_id: await withCancel(
          text(
            { 
              message: 'Cloudflare Account ID',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        ),
        database_id: await withCancel(
          text(
            { 
              message: 'Cloudflare D1 Database ID',
              validate: required,
            }
          ),
        ),
        api_token: await withCancel(
          text(
            { 
              message: 'Cloudflare Access API Token with D1 Read/Write roles',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        )
      }
      return config;
    }
    
    case "neon_http": {
      /** @type {import('@storecraft/database-neon').NeonHttpConfig} */
      let config = {
        connectionString: await withCancel(
          text(
            { 
              message: 'Neon Connection String',
              validate: required,
            }
          ),
        )
      }
      return config;
    }

    case "neon_ws": {
      /** @type {import('@storecraft/database-neon').NeonServerlessConfig} */
      let config = {
        // @ts-ignore
        neonConfig: {
        },
        poolConfig: {
          connectionString: await withCancel(
            text(
              { 
                message: 'Neon Connection String',
                validate: required,
              }
            ),
          )
        }
      }
      return config;
    }

    
    case "planetscale": {
      /** @type {import('@storecraft/database-planetscale').PlanetScaleDialectConfig} */
      let config = {
        url: await withCancel(
          text(
            { 
              message: 'Planetscale Connection URL',
              validate: required,
            }
          ),
        ),
        useSharedConnection: await withCancel(
          confirm(
            { 
              message: 'Planetscale: Use shared connection ?',
              active: 'Yes',
              inactive: 'No',
              initialValue: true
            }
          ),
        )
      }
      return config;
    }

  }

}