import { useEffect, useRef, useState } from 'react'
import ShowIf from './show-if.jsx'
import MDView from './md-view.jsx'
import { useStorecraft } from '@storecraft/sdk-react-hooks'
import ResourceView from './resource-view.jsx'
import { Span, TimeStampView } from './common-fields.jsx'


/**
 * 
 * @param {import('./fields-view.jsx').FieldLeafViewParams<
 *    import('@storecraft/core/v-api').CustomerType,
 *    import('../pages/discount.jsx').Context,
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
      { key: 'id', name: 'ID', comp: Span },
      { key: 'updated_at', name: 'Last Updated', comp: TimeStampView },
      { key: 'price', name: 'Price', comp: Span },
    ]
  );


  return (
<div {...rest}>
  <ResourceView 
      limit={5}
      resource={`customers/${value?.email}/orders`}
      schema={schema.current}/>
 
</div>
  )
}

export default CustomerOrders