import { select, input, confirm } from "@inquirer/prompts";

/** @satisfies {import("../utils.js").Choice[]} */
export const choices = /** @type {const} */ ([
  {
    name: 'sqlite',
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
    name: 'Turso',
    value: 'turso',
    description: 'Cloud SQLite database'
  },
  {
    name: 'Cloudflare D1',
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

  const id = await select(
    {
      message: '💾 Select a database',
      choices,
      loop: true,
    }
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
    case 'sqlite':
      break;
    case "postgres":
      break;
    case "mysql":
      break;
    case "mongo_db": {
      /** @type {import('@storecraft/database-mongodb-node').Config} */
      const config = {
        url: await input(
          { 
            message: 'Enter the connection url',
            required: true,
          }
        )
      }
      return config;
    }

    case "turso": {
      /** @type {import('@storecraft/database-turso').Config} */
      let config = {
        prefers_batch_over_transactions: true,
        libsqlConfig: {
          url: await input(
            { 
              message: 'Enter connection url',
              required: true,
            }
          ),
          authToken: await input(
            { 
              message: 'Enter the auth token',
              required: true,
            }
          )
        }
      }
      return config;
    }

    case "d1": {
      /** @type {import('@storecraft/database-cloudflare-d1').D1ConfigHTTP} */
      let config = {
        account_id: await input(
          { 
            message: 'Cloudflare Account ID',
            required: true,
          }
        ),
        database_id: await input(
          { 
            message: 'Cloudflare D1 Database ID',
            required: true,
          }
        ),
        api_token: await input(
          { 
            message: 'Cloudflare Access API Token with D1 Read/Write roles',
            required: true,
          }
        ),
      }
      return config;
    }
    
    case "neon_http": {
      /** @type {import('@storecraft/database-neon').NeonHttpConfig} */
      let config = {
        connectionString: await input(
          { 
            message: 'Neon Connection String',
            required: true,
          }
        ),
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
          connectionString: await input(
            { 
              message: 'Neon Connection String',
              required: true,
            }
          ),
        }
      }
      return config;
    }

    
    case "planetscale": {
      /** @type {import('@storecraft/database-planetscale').PlanetScaleDialectConfig} */
      let config = {
        url: await input(
          { 
            message: 'Connection URL',
            required: true,
          }
        ),
        useSharedConnection: await confirm(
          { 
            message: 'Use shared connection',
            default: true,
          }
        ),
      }
      return config;
    }

  }

}