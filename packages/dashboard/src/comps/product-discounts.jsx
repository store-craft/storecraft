import { useCallback } from 'react'
import { Label } from './common-ui.jsx'
import useNavigateWithState from '@/hooks/useNavigateWithState.jsx'
import ShowIf from './show-if.jsx'
import MDView from './md-view.jsx'


/**
 * 
 * @typedef {object} ItemParams
 * @prop {import('@storecraft/core/v-api').DiscountType} value `discount`
 * @prop {(value: import('@storecraft/core/v-api').DiscountType) => void} onClick callback
 * 
 * 
 * @param {ItemParams} params
 */
const Item = (
  { 
    value, onClick 
  }
) => {

  return (
<div className='w-full flex flex-col gap-2
                py-3 border-b shelf-border-color'>
  <div className='flex flex-row justify-between items-center'>
    <Label >
      <a onClick={() => onClick(value)} className='cursor-pointer' >
        <span children={value?.title} />                  
      </a>
    </Label>
    <MDView value={`**\`${value.info.details.meta.name}\`**`} className='text-right' />
  </div>

  <MDView value={value?.description ?? 'Discount does not have `description`'} />
</div>    
  )
}

/**
 * 
 * @param {import('./fields-view.jsx').FieldLeafViewParams<
 *    import('@storecraft/core/v-api').ProductType["discounts"],
 *    import('../pages/product.jsx').Context
 *  > &
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params 
 * 
 */
const ProductDiscounts = (
  { 
    field, context, value=[], onChange, setError, ...rest 
  }
) => {
  const has_discounts = value.length>0;

  const { navWithState } = useNavigateWithState()

  const onClick = useCallback(
    /**
     * 
     * @param {import('@storecraft/core/v-api').DiscountType} discount 
     */
    (discount) => {
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
              key={discount.id} />
        )
      )
    }
    </div> 
  </ShowIf>
</div>
  )
}

export default ProductDiscounts