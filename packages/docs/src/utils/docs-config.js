
export default {
  name: 'docs',
  groups: [

    {
      title: "Start Here",
      icon: {
        name: 'BiLogoStackOverflow',
        params: { classNames: 'stroke-kf-600'}
      }, 
      groups: [
        {
          title: "What Is This ?",
          route: `start-here/what`,
          path: `content/docs/start-here/what.mdx`
        },
        {
          title: "Why use it ?",
          route: `start-here/why`,
          path: `content/docs/start-here/why.mdx`
        },
      ]
    },

    {
      title: "Setup",
      icon: {
        name: 'BsNewspaper',
        params: { classNames: 'stroke-kf-600'}
      }, 
      groups: [
        {
          title: "Firebase Project",
          route: `setup/project`,
          path: `content/docs/setup/firebase-project.mdx`
        },
        {
          title: "Authentication",
          route: `setup/authentication`,
          path: `content/docs/setup/firebase-authentication.mdx`
        },
        {
          title: "Storage",
          route: `setup/storage`,
          path: `content/docs/setup/firebase-storage.mdx`
        },
        {
          title: "Firestore Database",
          route: `setup/firestore`,
          path: `content/docs/setup/firebase-firestore.mdx`
        },

      ]
    },

    {
      title: 'Dashboard',
      icon: {
        name: 'MdAdminPanelSettings',
        params: {}
      },
      groups: [
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
      title: 'Backend',
      icon: {
        name: 'FaServer',
        params: {}
      },
      groups: [
        {
          title: 'Databases',
          route: 'backend/databases',
          empty: true,
          groups: [
            {
              title: 'SQL',
              route: 'backend/databases/sql',
              path: 'content/docs/backend/databases/sql.mdx'
            },
            {
              title: 'Mongo DB',
              route: 'backend/databases/mongo',
              path: 'content/docs/backend/databases/mongo.mdx'
            },
          ]
        },
        {
          title: 'Storage',
          route: 'backend/storage',
          empty: true,
          groups: [
            {
              title: 'S3 Compatible',
              route: 'backend/storage/s3',
              path: 'content/docs/backend/storage/s3.mdx'
            },
            {
              title: 'Google Storage',
              route: 'backend/storage/google',
              path: 'content/docs/backend/storage/google.mdx'
            },
            {
              title: 'Node Local Storage',
              route: 'backend/storage/node-local',
              path: 'content/docs/backend/storage/node-local.mdx'
            },
          ]
        },    
        {
          title: 'Email',
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
          title: 'Platforms',
          route: 'backend/platforms',
          path: 'content/docs/backend/platforms/overview.mdx',
          groups: [
            {
              title: 'Node.js',
              route: 'backend/platforms/node-js',
              path: 'content/docs/backend/platforms/node-js.mdx'
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
          title: 'Resources',
          route: 'backend/resources',
          empty: true,
          groups: [
            {
              title: 'Overview',
              route: 'backend/resources/overview',
              path: 'content/docs/backend/resources/overview.mdx'
            },
            {
              title: 'Query Guide',
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
          title: 'Checkout & Payments',
          route: 'backend/checkout-and-payments',
          empty: true,
          groups: [
            {
              title: 'Checkouts',
              route: 'backend/checkout-and-payments',
              path: 'content/docs/backend/checkout-and-payments/checkouts.mdx'
            },
    
          ]
        },
        {
          title: 'Events',
          route: 'backend/events',
          path: 'content/docs/backend/events.mdx'
        },
        {
          title: 'Notifications',
          route: 'backend/notifications',
          path: 'content/docs/backend/notifications.mdx'
        },
        {
          title: 'Auth',
          route: 'backend/auth',
          path: 'content/docs/backend/auth/overview.mdx'
        },

      ]
    }
  ]
}
