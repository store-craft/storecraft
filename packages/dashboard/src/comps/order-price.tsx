import { useCallback, useState } from 'react'
import { BlingInput, HR } from './common-ui'
import { useStorecraft } from '@storecraft/sdk-react-hooks'
import { LinkWithState } from '@/hooks/use-navigate-with-state'
import { FieldLeafViewParams } from './fields-view';
import { OrderData, PricingData } from '@storecraft/core/api';

export type EntryParams = {
  title: string;
  description?: string;
  link?: string;
  value: number;
  context?: import('../pages/order.js').Context;
};

export type OrderPriceParams = FieldLeafViewParams<
  Partial<PricingData>, 
  import('../pages/order.js').Context, 
  OrderData
> & React.ComponentProps<'div'>;

const Entry = (
  {
    title, value, description='', link, context
  }: EntryParams
) => {

  return (
    <div 
      className='flex flex-row justify-between 
        items-center w-full' 
      title={description ?? title}>
      {
        link &&
        <LinkWithState 
          to={link} 
          current_state={
            () => context?.getState && context?.getState()
          }
          draggable='false'>
          <span 
            children={title}
            className='text-sm font-medium underline'
          />
        </LinkWithState>
      }
      {
        !link &&
        <span 
          children={title}
          className='text-sm font-medium '
        />
      }
      <span 
        children={value} 
        className='text-xs'
      />
    </div>
  )
}


const OrderPrice = (
  { 
    field, context, setError, value, 
    onChange, ...rest 
  }: OrderPriceParams
) => {
  
  const { sdk } = useStorecraft();
  const [pricing, setPricing] = useState(
    value
  );
  const { key, comp_params } = field;

  // console.log('lineItems ', lineItems)
  // console.log('context ', context)
    
  const onUpdatePrice = useCallback(
    (e) => {
      const total = parseFloat(e.currentTarget.value);
      console.log('total ', total);

      const new_pricing = {
        ...pricing,
        total
      }

      setPricing(new_pricing);
      onChange(new_pricing);

    }, [pricing, onChange]
  );
  
  const onCalculatePrice = useCallback(
    async (_) => {
      // const { pubsub, query } = context;

      try {
        setError(undefined);

        const pricing_new = await sdk.checkout.pricing(
          context.getState().data
        );

        setPricing(pricing_new);
        onChange(pricing_new);

        console.log('pricing ', pricing_new);
  
      } catch(e) {
        setError('An error occured while calculating pricing');
      }
    },
    [context]
  );

  return (
<div {...comp_params}>
  
  <div className='flex flex-col gap-3 w-full --shelf-text-minor'>
    <Entry 
      title='SubTotal' 
      value={pricing?.subtotal_undiscounted ?? 0} 
    />
    <Entry 
      title='Shipping' 
      value={pricing?.shipping_method?.price ?? 0} 
    />
    { // discounts
      pricing?.evo?.slice(1).filter(e => e.total_discount>0).map(
        e => (
          <Entry 
            key={e.discount_code}
            title={`${e.discount_code} (discount)`} 
            value={-e.total_discount} 
            link={`/pages/discounts/${e.discount_code}`}
            context={context}
          />
        )
      )
    }
    { // taxes
      pricing?.taxes.map(
        (tax) => (
          <Entry 
            key={tax.name}
            title={`${tax.name} (tax)`} 
            value={-Math.abs(tax.value)} 
            description={tax.description}
            context={context}
          />
        )
      )
    }
  </div>
  <HR className='my-5'/>
  <div 
    className='flex flex-row justify-between 
      items-center'>
    <span 
      children='Total'
      className='text-sm font-medium '
    />
    <span 
      children='Calculate Price' 
      className='text-sm font-medium underline 
        shelf-text-label-color cursor-pointer' 
      onClick={onCalculatePrice}
    />
  </div>
  <BlingInput 
    className='mt-2 w-full' 
    onChange={onUpdatePrice} 
    onWheel={(e) => (e.target as HTMLInputElement).blur()}
    value={pricing?.total ?? 0} 
    placeholder='Price' 
    type='number' 
    min='0' 
  />

</div>
  )
}

export default OrderPrice