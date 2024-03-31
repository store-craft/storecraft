import { useCallback, useRef, useState } from 'react'
import CapsulesView from './capsules-view.jsx'
import { BlingInput } from './common-ui.jsx'
import { BlingButton } from './common-button.jsx'
import SelectCollection from './select-collection.jsx'
// import { DiscountData } from '@/admin-sdk/js-docs-types'
import { useNavigate } from 'react-router-dom'
import { HR } from './common-ui.jsx'

const isEmpty = (str) => (!str?.trim().length)

const OrderCouponInfo = ({field, value, onChange, ...rest}) => {
  const ref_name = useRef()
  const { key, name, comp_params } = field
  /**@type {[discounts: DiscountData[]]} */
  const [discounts, setDiscounts] = useState(value ?? [])
  const nav = useNavigate()

  const onSelect = useCallback(
    (t) => {
      const new_discounts = [
        t[1], ...discounts.filter(d => d.code!==t[0])
      ]
      onChange(new_discounts)
      setDiscounts(new_discounts)
    },
    [discounts, onChange]
  )

  const onManualAdd = useCallback(
    () => {
      const code = ref_name.current.value?.trim()
      if(isEmpty(code)) return
      onSelect([code, { code }])
    },
    [onSelect, isEmpty]
  )
  
  const onClick = useCallback(
    /**
     * 
     * @param {DiscountData} v 
     */
    (v) => {
      const where = v.code
      nav(`/pages/discounts/${where}/edit`)
    },
    [nav]
  )

  const onRemove = useCallback(
    (t) => {
      const new_discounts = [
        ...discounts.filter(d => d.code!==t.code)
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
  <SelectCollection collectionId='discounts' layout={1}
                    className='mt-3' 
                    transform_fn={
                      page => page.filter(it => it[1].application.id==1 && it[1].enabled)
                    }
                    onSelect={onSelect}
                    name_fn={tuple => tuple?.[1]?.code}
                    header='Add Coupons Codes you defined' 
                    clsHeader='text-gray-500' 
                    clsReload='text-pink-500 text-3xl' />
  <CapsulesView onClick={onClick} 
                onRemove={onRemove}
                name_fn={d => d?.code}
                tags={discounts} className='mt-3' 
                clsCapsule='bg-pink-500' />  
</div>
  )
}

export default OrderCouponInfo