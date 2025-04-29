import { useCallback } from 'react'
import { Label } from './common-ui'
import useNavigateWithState from '@/hooks/use-navigate-with-state'
import ShowIf from './show-if'
import MDView from './md-view'
import { DiscountType, ProductType } from '@storecraft/core/api'
import { FieldLeafViewParams } from './fields-view'
import { enums } from '@storecraft/core/api'

export type ItemParams = {
  /**
   * `discount`
   */
  value: DiscountType;
  /**
   * callback
   */
  onClick: (value: DiscountType) => void;
};

const Item = (
  { 
    value, onClick 
  }: ItemParams
) => {
  const type = value.info.details.type ?? value.info.details.meta.type;
  const readable_discount_type = enums.DiscountMetaEnum?.[type]?.name ?? 
    type ?? 'unknown';

  return (
<div 
  className='w-full flex flex-col gap-2
    py-3 border-b shelf-border-color'>
  <div 
    className='flex flex-row justify-between items-center'>
    <Label >
      <a 
        onClick={() => onClick(value)} 
        className='cursor-pointer' 
      >
        <span children={value?.title} />                  
      </a>
    </Label>
    <MDView 
      value={`**\`${readable_discount_type}\`**`} 
      className='text-right' 
    />
  </div>

  <MDView 
    value={value?.description ?? 'Discount does not have `description`'} 
  />
</div>    
  )
}


export type ProductDiscountsParams = FieldLeafViewParams<
  ProductType["discounts"],
  import('../pages/product.jsx').Context
> & React.ComponentProps<'div'>;

const ProductDiscounts = (
  { 
    field, context, value=[], onChange, setError, ...rest 
  }: ProductDiscountsParams
) => {
  const has_discounts = value.length>0;

  const { navWithState } = useNavigateWithState()

  const onClick = useCallback(
    (discount: DiscountType) => {
      // const all = context?.query.all.get(false)?.data
      const state = context?.getState();
      navWithState(`/pages/discounts/${discount.handle}`, state);
    },
    [navWithState, context]
  );


  return (
<div {...rest}>
  <ShowIf show={!has_discounts}>
    <MDView value='This `product` is not **eligible** for `discounts`' />
  </ShowIf>
  <ShowIf show={has_discounts}>
    <div className='flex flex-col max-h-52 overflow-y-scroll'>
    {
      value.map(
        discount => (
          <Item 
            value={discount} 
            onClick={onClick}
            key={discount.id} 
          />
        )
      )
    }
    </div> 
  </ShowIf>
</div>
  )
}

export default ProductDiscounts