
export type Doc = {
  name: string
  groups: DocGroup[]
}

export type DocGroup = {
  title: string
  icon?: {
    name: string
    params?: {
      classNames?: string
    }
  }
  padding_override?: string
  empty?: boolean
  route?: string
  path?: string
  external?: string
  groups?: DocGroup[]
}

export default {
  name: 'docs',
  groups: [
    {
      title: "Start Here",
      icon: {
        name: 'BiLogoStackOverflow',
        params: { classNames: 'stroke-kf-600'}
      }, 
      empty: true,
      groups: [
        {
          title: "What Is This ?",
          route: `start-here/what`,
          path: `content/docs/start-here/what.mdx`
        },
        {
          title: "Installation",
          route: `setup/installation`,
          path: `content/docs/start-here/installation.mdx`
        },
        {
          title: "Example Nodejs & SQLite",
          route: `setup/local-sqlite`,
          path: `content/docs/start-here/local-node-sqlite.mdx`
        },
        {
          title: "Example Nodejs & MongoDB",
          route: `setup/local-node-mongodb`,
          path: `content/docs/start-here/local-node-mongodb.mdx`
        },
        {
          title: "Example Google Functions & MongoDB",
          route: `setup/google-functions-mongo`,
          path: `content/docs/start-here/google-functions-mongo.mdx`
        },

      ]
    },

    {
      title: 'Backend',
      icon: {
        name: 'FaLaptopCode',
        params: {}
      },
      empty: true,
      groups: [
        {
          title: '✨ Quick Overview',
          route: 'backend/overview',
          path: 'content/docs/backend/overview.mdx'
        },
        {
          title: '⚙️ Configuration',
          route: 'backend/config',
          path: 'content/docs/backend/config.mdx'
        },
        {
          title: '💾 Databases',
          route: 'backend/databases',
          empty: true,
          groups: [
            {
              title: 'SQLite (with libsql)',
              route: 'backend/databases/libsql',
              path: 'content/docs/backend/databases/libsql.mdx'
            },
            {
              title: 'SQLite',
              route: 'backend/databases/sqlite',
              path: 'content/docs/backend/databases/sqlite.mdx'
            },
            {
              title: 'Postgres',
              route: 'backend/databases/postgres',
              path: 'content/docs/backend/databases/postgres.mdx'
            },
            {
              title: 'MySQL',
              route: 'backend/databases/mysql',
              path: 'content/docs/backend/databases/mysql.mdx'
            },
            {
              title: 'SQL Base',
              route: 'backend/databases/sql',
              path: 'content/docs/backend/databases/sql.mdx'
            },
            {
              title: 'Mongo DB',
              route: 'backend/databases/mongo',
              path: 'content/docs/backend/databases/mongo.mdx'
            },
            {
              title: 'Turso (cloud sqlite)',
              route: 'backend/databases/turso',
              path: 'content/docs/backend/databases/turso.mdx'
            },
            {
              title: 'Cloudflare D1 (cloud sqlite)',
              route: 'backend/databases/d1',
              path: 'content/docs/backend/databases/d1.mdx'
            },
            {
              title: 'Neon (cloud postgres)',
              route: 'backend/databases/neon',
              path: 'content/docs/backend/databases/neon.mdx'
            },
            {
              title: 'Planetscale (cloud mysql)',
              route: 'backend/databases/planetscale',
              path: 'content/docs/backend/databases/planetscale.mdx'
            },
          ]
        },
        {
          title: '📦 Storage',
          route: 'backend/storage',
          empty: true,
          groups: [
            {
              title: 'Node / Deno / Bun Local Storage',
              route: 'backend/storage/local',
              path: 'content/docs/backend/storage/storage-local.mdx'
            },
            {
              title: 'AWS S3',
              route: 'backend/storage/s3',
              path: 'content/docs/backend/storage/s3.mdx'
            },
            {
              title: 'Cloudflare R2',
              route: 'backend/storage/r2',
              path: 'content/docs/backend/storage/r2.mdx'
            },
            {
              title: 'Any S3 Compatible',
              route: 'backend/storage/s3-compatible',
              path: 'content/docs/backend/storage/s3-compatible.mdx'
            },
            {
              title: 'Google Storage',
              route: 'backend/storage/google',
              path: 'content/docs/backend/storage/google.mdx'
            },
          ]
        },    
        {
          title: '🌐 Platforms',
          route: 'backend/platforms',
          path: 'content/docs/backend/platforms/overview.mdx',
          groups: [
            {
              title: 'Node.js',
              route: 'backend/platforms/node',
              path: 'content/docs/backend/platforms/node.mdx'
            },
            {
              title: 'Bun',
              route: 'backend/platforms/bun',
              path: 'content/docs/backend/platforms/bun.mdx'
            },
            {
              title: 'Deno',
              route: 'backend/platforms/deno',
              path: 'content/docs/backend/platforms/deno.mdx'
            },
            {
              title: 'AWS API Gateway',
              route: 'backend/platforms/aws-api-gateway',
              path: 'content/docs/backend/platforms/aws-api-gateway.mdx'
            },
            {
              title: 'Cloudflare Workers',
              route: 'backend/platforms/cloudflare-workers',
              path: 'content/docs/backend/platforms/cloudflare-workers.mdx'
            },
            {
              title: 'Google Functions',
              route: 'backend/platforms/google-functions',
              path: 'content/docs/backend/platforms/google-functions.mdx'
            },
            {
              title: 'Roll Your Own',
              route: 'backend/platforms/roll-your-own',
              path: 'content/docs/backend/platforms/roll-your-own.mdx'
            },
          ]
        }, 
        {
          title: '📚 Query Resources',
          route: 'backend/resources',
          empty: true,
          groups: [
            {
              title: 'Overview',
              route: 'backend/resources/overview',
              path: 'content/docs/backend/resources/overview.mdx'
            },
            {
              title: 'VQL Query Guide',
              route: 'backend/resources/query',
              path: 'content/docs/backend/resources/query.mdx'
            },
            {
              title: 'Products',
              route: 'backend/resources/products',
              path: 'content/docs/backend/resources/products.mdx'
            },
            {
              title: 'Collections',
              route: 'backend/resources/collections',
              path: 'content/docs/backend/resources/collections.mdx'
            },
            {
              title: 'Storefronts',
              route: 'backend/resources/storefronts',
              path: 'content/docs/backend/resources/storefronts.mdx'
            },
            {
              title: 'Discounts',
              route: 'backend/resources/discounts',
              path: 'content/docs/backend/resources/discounts.mdx'
            },
          ]
        },                    
        {
          title: '🤖 AI',
          route: 'backend/ai',
          empty: true,
          groups: [
            {
              title: 'Chat Providers',
              route: 'backend/ai/chat-providers',
              path: 'content/docs/backend/ai/chat-providers.mdx'
            },
            {
              title: 'Embedding Providers',
              route: 'backend/ai/embedding-providers',
              path: 'content/docs/backend/ai/embedding-providers.mdx'
            },
            {
              title: 'Vector Store Providers',
              route: 'backend/ai/vector-store-providers',
              path: 'content/docs/backend/ai/vector-store-providers.mdx'
            },
            {
              title: 'AI Agents',
              route: 'backend/ai/agents',
              path: 'content/docs/backend/ai/agents.mdx'
            },
          ]
        },   
        {
          title: '📧 Email',
          route: 'backend/email',
          empty: true,
          groups: [
            {
              title: 'Serverless Email Providers',
              route: 'backend/email/http',
              path: 'content/docs/backend/email/http.mdx'
            },
            {
              title: 'SMTP for Node',
              route: 'backend/email/smtp-node',
              path: 'content/docs/backend/email/smtp-node.mdx'
            },
          ]
        },            
        {
          title: '💳 Checkout & Payments',
          route: 'backend/checkout-and-payments',
          empty: true,
          groups: [
            {
              title: 'Checkouts',
              route: 'backend/checkout-and-payments/checkouts',
              path: 'content/docs/backend/checkout-and-payments/checkouts.mdx'
            },
            {
              title: 'Paypal',
              route: 'backend/checkout-and-payments/paypal',
              path: 'content/docs/backend/checkout-and-payments/paypal.mdx'
            },
            {
              title: 'Stripe',
              route: 'backend/checkout-and-payments/stripe',
              path: 'content/docs/backend/checkout-and-payments/stripe.mdx'
            },
            {
              title: 'Taxes',
              route: 'backend/checkout-and-payments/taxes',
              path: 'content/docs/backend/checkout-and-payments/taxes.mdx'
            },
            {
              title: 'Roll Your Own Payment Gateway',
              route: 'backend/checkout-and-payments/roll-your-own',
              path: 'content/docs/backend/checkout-and-payments/roll-your-own.mdx'
            },
    
          ]
        },
        {
          title: '📅 Events',
          route: 'backend/events',
          path: 'content/docs/backend/events.mdx'
        },
        {
          title: '🔔 Notifications',
          route: 'backend/notifications',
          path: 'content/docs/backend/notifications.mdx'
        },
        {
          title: '🔑 Auth',
          route: 'backend/auth',
          empty: true,
          groups: [
            {
              title: 'JWT',
              route: 'backend/auth/jwt',
              path: 'content/docs/backend/auth/jwt.mdx'
            },
            {
              title: 'Basic Auth',
              route: 'backend/auth/basic',
              path: 'content/docs/backend/auth/basic.mdx'
            },
            {
              title: 'API Keys',
              route: 'backend/auth/api-keys',
              path: 'content/docs/backend/auth/api-keys.mdx'
            },
            {
              title: 'Social Auth',
              route: 'backend/auth/social-auth',
              path: 'content/docs/backend/auth/social-auth.mdx'
            },
          ]
        },
        {
          title: '🧪 Extensions',
          route: 'backend/extensions',
          empty: true,
          groups: [
            {
              title: 'Overview',
              route: 'backend/extensions/overview',
              path: 'content/docs/backend/extensions/overview.mdx'
            },
            {
              title: 'Postman Events Emailer',
              route: 'backend/extensions/postman',
              path: 'content/docs/backend/extensions/postman.mdx'
            },
            {
              title: 'Roll Your Own',
              route: 'backend/extensions/roll-your-own',
              path: 'content/docs/backend/extensions/roll-your-own.mdx'
            },
          ]
        },
        {
          title: '🔎 Testing',
          route: 'backend/testing',
          path: 'content/docs/backend/testing.mdx'
        },
      ]
    },

    {
      title: 'Dashboard',
      icon: {
        name: 'MdOutlineSpaceDashboard',
        params: {}
      },
      empty: true,
      groups: [
        {
          title: 'Overview',
          route: 'dashboard/overview',
          path: 'content/docs/dashboard/overview.mdx'
        },
        {
          title: 'Products Collections',
          route: 'dashboard/collections',
          path: 'content/docs/dashboard/collections.mdx'
        },
        {
          title: 'Products Variants',
          route: 'dashboard/variants',
          path: 'content/docs/dashboard/variants.mdx'
        },
        {
          title: 'Creating Storefronts',
          route: 'dashboard/storefronts',
          path: 'content/docs/dashboard/storefronts.mdx'
        },
        {
          title: 'Creating Discounts',
          route: 'dashboard/discounts',
          path: 'content/docs/dashboard/discounts.mdx'
        },
        {
          title: 'Creating Orders',
          route: 'dashboard/orders',
          path: 'content/docs/dashboard/orders.mdx'
        },
        {
          title: 'Tags and Attributes',
          route: 'dashboard/tags',
          path: 'content/docs/dashboard/tags.mdx'
        },
        {
          title: 'Media Management',
          route: 'dashboard/media',
          path: 'content/docs/dashboard/media.mdx'
        },

      ]
    },

    {
      title: "AI Chat",
      icon: {
        name: 'FaRobot',
        params: { classNames: 'stroke-kf-600'}
      }, 
      empty: false,
      route: `chat`,
      path: `content/docs/chat/intro.mdx`

    },

    {
      title: "SDK",
      icon: {
        name: 'TbSdk',
        params: { classNames: 'stroke-kf-600'}
      }, 
      empty: true,
      groups: [
        {
          title: "Javascript SDK",
          route: `sdk/js-sdk`,
          path: `content/docs/sdk/js-sdk.mdx`
        },
        {
          title: "React Hooks SDK",
          route: `sdk/react-hooks-sdk`,
          path: `content/docs/sdk/react-hooks-sdk.mdx`
        },
      ]
    },

    {
      title: "REST API",
      icon: {
        name: 'TbHttpGet',
        params: { classNames: 'stroke-kf-600'}
      }, 
      padding_override: 'px-0',
      route: 'rest-api/api',
    },

    {
      title: "CLI",
      icon: {
        name: 'FaTerminal',
        params: { classNames: 'stroke-kf-600'}
      }, 
      route: 'cli',
      path: 'content/docs/cli/cli.mdx'
    },


  ]
} as Doc;
