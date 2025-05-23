import React from 'react'

const upsert = (v: string) => {
  return `
  {
    previous: ${v}, 
    current: ${v} 
  }
  `
}

const remove = (v: string) => {
  return `
  {
    previous: ${v}, 
    success: boolean 
  }
  `
}

const get = (v: string) => {
  return `
  {
    current: ${v}, 
  }
  `
}

const data = [
  {
    name: 'auth',
    events: [
      { event: 'auth/signup', dispatches: 'Partial<AuthUserType>' },
      { event: 'auth/signin', dispatches: 'Partial<AuthUserType>' },
      { event: 'auth/refresh', dispatches: 'Partial<ApiAuthResult>' },
      { event: 'auth/remove', dispatches: 'Partial<AuthUserType>' },
      { event: 'auth/upsert', dispatches: 'Partial<AuthUserType>' },
      { event: 'auth/apikey-created', dispatches: 'Partial<AuthUserType>' },
      { event: 'auth/change-password', dispatches: 'Partial<AuthUserType>' },

      { 
        event: 'auth/confirm-email-token-generated', 
        dispatches: `
  { 
    auth_user: Partial<AuthUserType>, 
    token: string 
  }

` 
  },
      { event: 'auth/confirm-email-token-confirmed', dispatches: 'Partial<AuthUserType>' },

      { 
        event: 'auth/forgot-password-token-generated', 
        dispatches: `
  { 
    auth_user: Partial<AuthUserType>, 
    token: string 
  }
    
` 
      },
      { event: 'auth/forgot-password-token-confirmed', dispatches: 'Partial<AuthUserType>' },
    ]
  },
  {
    name: 'email',
    events: [
      { event: 'email/before-send', dispatches: 'Partial<MailObject>' },
      { 
        event: 'email/after-send', 
        dispatches: `
  {
    mail_object: Partial<MailObject>, 
    mail_response: Partial<MailResponse> 
  }
    
` 
      },
    ]
  },
  {
    name: 'orders',
    events: [
      { event: 'orders/upsert', dispatches: upsert('OrderData') },
      { event: 'orders/remove', dispatches: remove('OrderData') },
      { event: 'orders/get', dispatches: get('OrderData') },
      { event: 'orders/list', dispatches: get('OrderData[]') },

      { event: 'orders/checkout/created', dispatches: upsert('OrderData') },
      { event: 'orders/checkout/complete', dispatches: upsert('OrderData') },
      { event: 'orders/checkout/requires_action', dispatches: upsert('OrderData') },
      { event: 'orders/checkout/failed', dispatches: upsert('OrderData') },
      { event: 'orders/checkout/unknown', dispatches: upsert('OrderData') },
      { event: 'orders/checkout/update', dispatches: upsert('OrderData') },

      { event: 'orders/fulfillment/draft', dispatches: upsert('OrderData') },
      { event: 'orders/fulfillment/processing', dispatches: upsert('OrderData') },
      { event: 'orders/fulfillment/shipped', dispatches: upsert('OrderData') },
      { event: 'orders/fulfillment/fulfilled', dispatches: upsert('OrderData') },
      { event: 'orders/fulfillment/cancelled', dispatches: upsert('OrderData') },
      { event: 'orders/fulfillment/update', dispatches: upsert('OrderData') },

      { event: 'orders/payments/unpaid', dispatches: upsert('OrderData') },
      { event: 'orders/payments/authorized', dispatches: upsert('OrderData') },
      { event: 'orders/payments/captured', dispatches: upsert('OrderData') },
      { event: 'orders/payments/requires_auth', dispatches: upsert('OrderData') },
      { event: 'orders/payments/voided', dispatches: upsert('OrderData') },
      { event: 'orders/payments/failed', dispatches: upsert('OrderData') },
      { event: 'orders/payments/partially_paid', dispatches: upsert('OrderData') },
      { event: 'orders/payments/partially_refunded', dispatches: upsert('OrderData') },
      { event: 'orders/payments/cancelled', dispatches: upsert('OrderData') },
      { event: 'orders/payments/update', dispatches: upsert('OrderData') },

    ]
  },
  {
    name: 'storefronts',
    events: [
      { event: 'storefronts/upsert', dispatches: upsert('StorefrontType') },
      { event: 'storefronts/remove', dispatches: remove('StorefrontType') },
      { event: 'storefronts/get', dispatches: get('StorefrontType') },
      { event: 'storefronts/list', dispatches: get('StorefrontType[]') },
    ]
  },
  {
    name: 'customers',
    events: [
      { event: 'customers/upsert', dispatches: upsert('CustomerType') },
      { event: 'customers/remove', dispatches: remove('CustomerType') },
      { event: 'customers/get', dispatches: get('CustomerType') },
      { event: 'customers/list', dispatches: get('CustomerType[]') },
    ]
  },
  {
    name: 'products',
    events: [
      { event: 'products/upsert', dispatches: upsert('ProductType') },
      { event: 'products/remove', dispatches: remove('ProductType') },
      { event: 'products/get', dispatches: get('ProductType') },
      { event: 'products/list', dispatches: get('ProductType[]') },
    ]
  },
  {
    name: 'collections',
    events: [
      { event: 'collections/upsert', dispatches: upsert('CollectionType') },
      { event: 'collections/remove', dispatches: remove('CollectionType') },
      { event: 'collections/get', dispatches: get('CollectionType') },
      { event: 'collections/list', dispatches: get('CollectionType[]') },
    ]
  },
  {
    name: 'discounts',
    events: [
      { event: 'discounts/upsert', dispatches: upsert('DiscountType') },
      { event: 'discounts/remove', dispatches: remove('DiscountType') },
      { event: 'discounts/get', dispatches: get('DiscountType') },
      { event: 'discounts/list', dispatches: get('DiscountType[]') },
    ]
  },
  {
    name: 'tags',
    events: [
      { event: 'tags/upsert', dispatches: upsert('TagType') },
      { event: 'tags/remove', dispatches: remove('TagType') },
      { event: 'tags/get', dispatches: get('TagType') },
      { event: 'tags/list', dispatches: get('TagType[]') },
    ]
  },
  {
    name: 'shipping',
    events: [
      { event: 'shipping/upsert', dispatches: upsert('ShippingMethodType') },
      { event: 'shipping/remove', dispatches: remove('ShippingMethodType') },
      { event: 'shipping/get', dispatches: get('ShippingMethodType') },
      { event: 'shipping/list', dispatches: get('ShippingMethodType[]') },
    ]
  },
  {
    name: 'posts',
    events: [
      { event: 'posts/upsert', dispatches: upsert('PostType') },
      { event: 'posts/remove', dispatches: remove('PostType') },
      { event: 'posts/get', dispatches: get('PostType') },
      { event: 'posts/list', dispatches: get('PostType[]') },
    ]
  },
  {
    name: 'images',
    events: [
      { event: 'images/upsert', dispatches: upsert('ImageType') },
      { event: 'images/remove', dispatches: remove('ImageType') },
      { event: 'images/get', dispatches: get('ImageType') },
      { event: 'images/list', dispatches: get('ImageType[]') },
    ]
  },
  {
    name: 'templates',
    events: [
      { event: 'templates/upsert', dispatches: upsert('TemplateType') },
      { event: 'templates/remove', dispatches: remove('TemplateType') },
      { event: 'templates/get', dispatches: get('TemplateType') },
      { event: 'templates/list', dispatches: get('TemplateType[]') },
    ]
  },
]

export type EventTableParams = {
  rows: {
    event: string;
    dispatches: string;
  }[];
} & React.ComponentProps<'div'>;

const EventTable = (
  { 
    rows, className='w-full', ...rest 
  } : EventTableParams
) => {

return (

<div className={className} {...rest}>
  <div className='w-full overflow-x-auto '>
    <table className='w-full overflow-clip rounded-t-lg'>
      <thead className='text-left text-sm font-light bg-slate-100 dark:bg-slate-100/10 h-10 '>
        <tr >
          <th children={'event'} className='pl-1 font-light'/>
          <th children={'dispatches'} className='pr-5 font-light text-right'/>
          {/* <th children={'description'} className='px-3 text-right'/> */}
          {/* <th children={rows[0][0]} className='pl-1'/>
          <th children={rows[0][1]} className='pl-5'/>
          <th children={rows[0][2]} className='px-3 text-right'/> */}
        </tr>  
      </thead>

      <tbody className='font-light text-xs font-mono' >
      {
        rows.map(
          (it, ix) => (
          <tr key={ix} className='border-y border-kf-300/50 h-10'>
            <td children={it.event} 
                className='pl-1 tracking-widest font-semibold text-sm 
                        text-kf-500 dark:text-kf-400' />
            <td
                className='pl-5 tracking-widest font-semibold 
                  text-pink-500 dark:text-pink-400 --w-10
                  flex flex-row justify-end
                    --max-w-xs overflow-x-scroll' >
              <pre children={it.dispatches} 
                  className='p-0 text-sm bg-slate-200/10 dark:bg-slate-500/10 
                        text-pink-500 dark:text-pink-400'/>
            </td>
            {/* <td children={it.description} 
                className='px-3 text-right min-w-64' /> */}
          </tr>  
          )
        )
      }
      </tbody>

    </table>
  </div>  
</div>  
  )
}

export const EventsTable = () => {

  return (
    <div className='flex flex-col gap-5'>
      {
        data.map(
          (it, ix) => (
            <div key={ix}>
              <p children={it.name} className='text-2xl italic font-bold' />
              <EventTable rows={it.events} />
            </div>
          )
        )
      }
    </div>
  )
}
