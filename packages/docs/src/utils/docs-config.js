
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
          path: `content/docs/main/start-here-what.mdx`
        },
        {
          title: "Why use it ?",
          route: `start-here/why`,
          path: `content/docs/main/start-here-why.mdx`
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
          path: `content/docs/main/setup-firebase-project.mdx`
        },
        {
          title: "Authentication",
          route: `setup/authentication`,
          path: `content/docs/main/setup-firebase-authentication.mdx`
        },
        {
          title: "Storage",
          route: `setup/storage`,
          path: `content/docs/main/setup-firebase-storage.mdx`
        },
        {
          title: "Firestore Database",
          route: `setup/firestore`,
          path: `content/docs/main/setup-firebase-firestore.mdx`
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
          route: 'admin/collections',
          path: 'content/docs/main/admin-collections.mdx'
        },
        {
          title: 'Products Variants',
          route: 'admin/variants',
          path: 'content/docs/main/admin-variants.mdx'
        },
        {
          title: 'Creating Storefronts',
          route: 'admin/storefronts',
          path: 'content/docs/main/admin-storefronts.mdx'
        },
        {
          title: 'Creating Discounts',
          route: 'admin/discounts',
          path: 'content/docs/main/admin-discounts.mdx'
        },
        {
          title: 'Creating Orders',
          route: 'admin/orders',
          path: 'content/docs/main/admin-orders.mdx'
        },
        {
          title: 'Tags and Attributes',
          route: 'admin/tags',
          path: 'content/docs/main/admin-tags.mdx'
        },
        {
          title: 'Media Management',
          route: 'admin/media',
          path: 'content/docs/main/admin-media.mdx'
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
              path: 'content/docs/main/backend-databases-sql.mdx'
            },
            {
              title: 'Mongo DB',
              route: 'backend/databases/mongo',
              path: 'content/docs/main/backend-databases-mongodb.mdx'
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
              path: 'content/docs/main/backend-storage-s3.mdx'
            },
            {
              title: 'Google Storage',
              route: 'backend/storage/google',
              path: 'content/docs/main/backend-storage-google.mdx'
            },
            {
              title: 'Node Local Storage',
              route: 'backend/storage/node-local',
              path: 'content/docs/main/backend-storage-node-local.mdx'
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
              path: 'content/docs/main/backend-email-http.mdx'
            },
            {
              title: 'SMTP for Node',
              route: 'backend/email/smtp-node',
              path: 'content/docs/main/backend-email-smtp-node.mdx'
            },
          ]
        },            
        {
          title: 'Platforms',
          route: 'backend/platforms',
          path: 'content/docs/main/backend-platforms.mdx',
          groups: [
            {
              title: 'Node.js',
              route: 'backend/platforms/node-js',
              path: 'content/docs/main/backend-platforms-node-js.mdx'
            },
            {
              title: 'AWS API Gateway',
              route: 'backend/platforms/aws-api-gateway',
              path: 'content/docs/main/backend-platforms-aws-api-gateway.mdx'
            },
            {
              title: 'Cloudflare Workers',
              route: 'backend/platforms/cloudflare-workers',
              path: 'content/docs/main/backend-platforms-cloudflare-workers.mdx'
            },
            {
              title: 'Google Functions',
              route: 'backend/platforms/google-functions',
              path: 'content/docs/main/backend-platforms-google-functions.mdx'
            },
            {
              title: 'Roll Your Own',
              route: 'backend/platforms/roll-your-own',
              path: 'content/docs/main/backend-platforms-roll-your-own.mdx'
            },
          ]
        },            
        {
          title: 'Payments',
          route: 'backend/payments',
          path: 'content/docs/main/backend-payments.mdx'
        },
        {
          title: 'Checkouts',
          route: 'backend/checkouts',
          path: 'content/docs/main/backend-checkouts.mdx'
        },
        {
          title: 'Events',
          route: 'backend/events',
          path: 'content/docs/main/backend-events.mdx'
        },
        {
          title: 'Notifications',
          route: 'backend/notifications',
          path: 'content/docs/main/backend-notifications.mdx'
        },
        {
          title: 'Security',
          route: 'backend/security',
          path: 'content/docs/main/backend-security.mdx'
        },

      ]
    }
  ]
}
