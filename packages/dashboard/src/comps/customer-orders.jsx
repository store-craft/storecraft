import { useRef } from 'react'
import MDView from './md-view.jsx'
import ResourceView from './resource-view.jsx'
import { Span, TimeStampView } from './common-fields.jsx'
import { SimpleLink } from './common-table-fields.jsx'


/**
 * 
 * @param {import('./fields-view.jsx').FieldLeafViewParams<
 *    import('@storecraft/core/v-api').CustomerType,
 *    import('../pages/customer.jsx').Context,
 *    import('@storecraft/core/v-api').CustomerType
 *  > &
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params 
 * 
 */
const CustomerOrders = (
  { 
    value, field, context, error, setError, ...rest 
  }
) => { 
  const schema = useRef(
    [
      { 
        key: 'id', name: 'ID', 
        comp: ({...rest}) => (
          <SimpleLink {...rest} 
              url_fn={item=>`/pages/orders/${item?.id}`} 
              get_state={() => context.getState()}/>
        ) 
      },
      { key: 'updated_at', name: 'Last Updated', comp: TimeStampView },
      { key: 'pricing.total', name: 'Price', comp: Span, comp_params: {className: 'font-bold'} },
      { 
        key: 'status.fulfillment.name', name: 'Status', 
        comp: ({value}) => (
          value && 
          <MDView value={`**\`${value.toString()}\`**`} 
                  className='overflow-x-auto max-w-20 flex-shrink' />
        ) 
      },
    ]
  );


  return (
<div {...rest} >
  <ResourceView 
      limit={5}
      resource={`customers/${value?.email}/orders`}
      schema={schema.current}/>
 
</div>
  )
}

export default CustomerOrders