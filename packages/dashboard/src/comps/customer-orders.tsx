import { useRef } from 'react'
import MDView from './md-view'
import ResourceView from './resource-view'
import { Span, TimeStampView } from './common-fields'
import { SimpleLink } from './common-table-fields'
import { FieldLeafViewParams } from './fields-view'
import { CustomerType } from '@storecraft/core/api'


export type CustomerOrdersParams = FieldLeafViewParams<
  CustomerType, import('../pages/customer.js').Context, CustomerType
> & React.ComponentProps<'div'>;

const CustomerOrders = (
  { 
    value, field, context, error, setError, ...rest 
  }: CustomerOrdersParams
) => { 
  const schema = useRef(
    [
      { 
        key: 'id', name: 'ID', 
        comp: ({...rest}) => (
          <SimpleLink<CustomerType> {...rest} 
            url_fn={item=>`/pages/orders/${item?.id}`} 
            get_state={() => context.getState()}
          />
        ) 
      },
      { 
        key: 'updated_at', name: 'Last Updated', comp: TimeStampView 
      },
      { 
        key: 'pricing.total', name: 'Price', comp: Span, comp_params: {className: 'font-bold'} 
      },
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
    schema={schema.current}
  />
</div>
  )
}

export default CustomerOrders