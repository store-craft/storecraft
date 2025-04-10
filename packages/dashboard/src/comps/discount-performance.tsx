import { useEffect, useState } from 'react'
import ShowIf from './show-if'
import MDView from './md-view'
import { useStorecraft } from '@storecraft/sdk-react-hooks'
import { FieldLeafViewParams } from './fields-view'
import { DiscountType } from '@storecraft/core/api'

export type DiscountPerformanceParams = 
  FieldLeafViewParams<undefined, 
  import('../pages/discount.js').Context, 
  DiscountType
> & React.ComponentProps<'div'>;

const DiscountPerformance = (
  { 
    field, context, error, setError, ...rest 
  }: DiscountPerformanceParams
) => {
  const  { sdk } = useStorecraft();
  const [info, setInfo] = useState(
    { 
      affected_products_count: undefined,
      affected_orders_count: undefined,
      loaded: false
    }
  );

  const discount = context?.data;

  useEffect(
    () => {
      async function get() {
        const affected_products_count = await sdk.statistics.countOf(
          'products', {
            vql: `discount:${discount.handle} | discount:${discount.id}`
          }
        );

        const affected_orders_count = await sdk.statistics.countOf(
          'orders', {
            vql: `discount:${discount.handle} | discount:${discount.id}`
          }
        );

        setInfo(
          {
            affected_products_count,
            affected_orders_count,
            loaded: true
          }
        );

      }

      get().catch(e => setError('ouch, something wrong happened'));

    }, [discount]
  );

  let text = '';

  if(info.loaded) {
    text = `> This \`discount\` is **eligible** for **${info.affected_products_count}** \`products\` \n\n`;
    text += `> Also, This \`discount\` was applied in **${info.affected_orders_count}** \`orders\` \n\n`;
  }

  return (
<div {...rest}>
  <ShowIf show={info.loaded}>
    <MDView value={text} />
  </ShowIf>
 
</div>
  )
}

export default DiscountPerformance