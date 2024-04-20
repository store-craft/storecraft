import { useCallback, useState } from 'react'
import { BlingInput, HR } from './common-ui.jsx'
import { useStorecraft } from '@storecraft/sdk-react-hooks'

const Entry = ({title, value}) => {
  return (
    <div className='flex flex-row justify-between items-center w-full'>
      <span children={title}
            className='text-sm font-medium '/>
      <span children={value} 
            className='text-xs'/>            
    </div>
  )
}

/**
 * @typedef {import('./fields-view.jsx').FieldLeafViewParams<
 *  import('@storecraft/core/v-api').PricingData> & 
 *   React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } OrderPriceParams
 * 
 * @param {OrderPriceParams} param
 */
const OrderPrice = (
  { 
    field, context, setError, value, onChange, ...rest 
  }
) => {

  const { sdk } = useStorecraft();
  const [ pricing, setPricing ] = useState(value);
  const { key, comp_params } = field;

  // console.log('lineItems ', lineItems)
  // console.log('context ', context)
    
  const onUpdatePrice = useCallback(
    (e) => {
      const total = parseFloat(e.currentTarget.value)
      console.log('total ', total)
      const new_pricing = {
        ...pricing,
        total
      }
      setPricing(new_pricing)
      onChange(new_pricing)
    }, [pricing, onChange]
  )
  
  const onCalculatePrice = useCallback(
    async (_) => {
      const { pubsub, query } = context;

      // console.log('query', query)

      /**@type {import('@storecraft/core/v-api').LineItem[]} */
      const line_items = query['line_items'].get() ?? []
      /**@type {import('@storecraft/core/v-api').DiscountType[]} */
      const coupons = query['coupons'].get() ?? []
      /**@type {import('@storecraft/core/v-api').OrderData["contact"]["customer_id"]} */
      const uid = query['contact.customer_id']?.get();
      /**@type {import('@storecraft/core/v-api').ShippingMethodType} */
      const delivery = query['shipping_method'].get() ?? { price: 0 }
      if(!delivery.price)
        delivery.price = 0

      console.log('line_items ', line_items)
      console.log('coupons ', coupons)
      console.log('delivery ', delivery)
      console.log('uid ', uid)
      try {
        setError(undefined)
        const pricing_new = await sdk.orders.calculatePricing(
          line_items, coupons, delivery, uid
        )
        setPricing(pricing_new)
        onChange(pricing_new)
        console.log('pricing ', pricing_new)
  
      } catch(e) {
        setError('An error occured while calculating pricing')
      }
    },
    [context]
  );

  return (
<div {...comp_params}>
  
  <div className='flex flex-col gap-3 w-full --shelf-text-minor'>
    <Entry title='SubTotal' value={pricing?.subtotal_undiscounted ?? 0} />
    <Entry title='Shipping' value={pricing?.shipping_method?.price ?? 0} />
    {
      pricing?.evo?.slice(1).filter(e => e.total_discount>0).map(
        e => (
          <Entry 
              key={e.discount_code}
              title={`${e.discount_code} (discount)`} 
              value={-e.total_discount} />
        )
      )
    }
  </div>
  <HR className='my-5'/>
  <div className='flex flex-row justify-between items-center'>
    <span 
        children='Total'
        className='text-sm font-medium '/>
    <span 
        children='Calculate Price' 
        className='text-sm font-medium underline 
                  shelf-text-label-color cursor-pointer' 
        onClick={onCalculatePrice}/>
  </div>
  <BlingInput 
      className='mt-2 w-full' rounded='rounded-md'
      onChange={onUpdatePrice} 
      onWheel={(e) => e.target.blur()}
      value={pricing?.total ?? 0} 
      placeholder='Price' 
      type='number' min='0' />

</div>
  )
}

export default OrderPrice