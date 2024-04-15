import { useCallback, useRef, useState } from 'react'
import CapsulesView from './capsules-view.jsx'
import { BlingInput } from './common-ui.jsx'
import { BlingButton } from './common-button.jsx'
import SelectResource from './select-resource.jsx'
import { useNavigate } from 'react-router-dom'
import { HR } from './common-ui.jsx'

/** @param {string} str */
const isEmpty = (str) => (!str?.trim().length)

/**
 * 
 * @typedef {import('./fields-view.jsx').FieldLeafViewParams<
 *  import('@storecraft/core/v-api').DiscountType[]> & 
*   React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
* } MDEditorParams
* 
* @param {MDEditorParams} param
*/
const OrderCouponInfo = (
  {
    field, value, onChange, ...rest
  }
) => {
  
  /** @type {React.LegacyRef<HTMLInputElement>} */
  const ref_name = useRef();

  const { key, name, comp_params } = field
  /**@type {[discounts: import('@storecraft/core/v-api').DiscountType[], any]} */
  const [discounts, setDiscounts] = useState(value ?? [])
  const nav = useNavigate()

  const onSelect = useCallback(
    /**
     * @param {import('@storecraft/core/v-api').DiscountType} t 
     */
    (t) => {
      const new_discounts = [
        t, ...discounts.filter(d => d.handle!==t.handle)
      ];
      onChange(new_discounts)
      setDiscounts(new_discounts)
    },
    [discounts, onChange]
  )

  const onManualAdd = useCallback(
    () => {
      const handle = ref_name.current.value?.trim()
      if(isEmpty(handle)) return
      onSelect({ handle })
    },
    [onSelect, isEmpty]
  );
  
  const onClick = useCallback(
    /**
     * 
     * @param {import('@storecraft/core/v-api').DiscountType} v 
     */
    (v) => {
      const where = v.handle
      nav(`/pages/discounts/${where}/edit`)
    },
    [nav]
  )

  const onRemove = useCallback(
    /** @param {import('@storecraft/core/v-api').DiscountType} t  */
    (t) => {
      const new_discounts = [
        ...discounts.filter(d => d.handle!==t.handle)
      ]
      onChange(new_discounts)
      setDiscounts(new_discounts)
    },
    [discounts, onChange]
  )
  
  return (
<div {...comp_params}>
  <p children='Coupon Code' className='text-gray-500'/>
  <div className='flex flex-row items-center mt-1 w-full h-fit'>
    <BlingInput ref={ref_name} rounded='rounded-md'
            placeholder='coupon' type='text' 
            className='mt-1'/>
    <BlingButton className='mt-1 ml-3 h-10 flex-1' stroke='p-0.5'
          children='Add' onClick={onManualAdd} />
  </div>
  <HR className='mt-5'/>
  <SelectResource 
      resource='discounts' layout={1}
      className='mt-3' 
      transform_fn={
        page => page.filter(
          /** @param {import('@storecraft/core/v-api').DiscountType} it  */
          it => it.application.id==1 && it.active
        )
      }
      onSelect={onSelect}
      name_fn={
        /** @param {import('@storecraft/core/v-api').DiscountType} d  */
        d => d.handle 
      }
      header='Add Coupons Codes you defined' 
      clsHeader='text-gray-500' 
      clsReload='text-pink-500 text-3xl' />

  <CapsulesView 
      onClick={onClick} 
      onRemove={onRemove}
      name_fn={
        /** @param {import('@storecraft/core/v-api').DiscountType} d  */
        d => d.handle
      }
      tags={discounts} className='mt-3' 
      clsCapsule='bg-pink-500' />  
</div>
  )
}

export default OrderCouponInfo