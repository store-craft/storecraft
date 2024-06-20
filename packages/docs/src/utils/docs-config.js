
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
          title: 'Overview',
          route: 'backend/overview',
          empty: true,
          // path: 'content/docs/main/backend-overview.mdx',
          groups: [
            {
              title: 'a',
              route: 'backend/overview/a',
              path: 'content/docs/main/backend-payments.mdx'
            },
            {
              title: 'b',
              route: 'backend/overview/b',
              path: 'content/docs/main/backend-payments.mdx'
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
