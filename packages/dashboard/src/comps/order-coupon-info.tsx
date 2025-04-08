import { useCallback, useRef, useState } from 'react'
import CapsulesView from './capsules-view.js'
import SelectResource from './select-resource.jsx'
import { useNavigate } from 'react-router-dom'
import { DiscountType, enums } from '@storecraft/core/api'
import { FieldLeafViewParams } from './fields-view.js'

export type MDEditorParams = FieldLeafViewParams<DiscountType[]> & 
  React.ComponentProps<'div'>;

const OrderCouponInfo = (
  {
    field, value, onChange, ...rest
  }: MDEditorParams
) => {
  
  const ref_name = useRef<HTMLInputElement>(undefined);

  const { key, name, comp_params } = field
  const [discounts, setDiscounts] = useState(value ?? [])
  const nav = useNavigate()

  const onSelect = useCallback(
    (t: DiscountType) => {
      const new_discounts = [
        t, ...discounts.filter(d => d.handle!==t.handle)
      ];
      onChange(new_discounts)
      setDiscounts(new_discounts)
    },
    [discounts, onChange]
  )

  const onClick = useCallback(
    (v: DiscountType) => {
      const where = v.handle
      nav(`/pages/discounts/${where}`)
    },
    [nav]
  )

  const onRemove = useCallback(
    (t: DiscountType) => {
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
  <SelectResource 
    resource='discounts' 
    layout={1}
    className='mt-3' 
    transform_fn={
      page => page.filter(
        it => it.application.id==enums.DiscountApplicationEnum.Manual.id && it.active
      )
    }
    onSelect={onSelect}
    name_fn={
      d => d.handle 
    }
    header='Add Coupons you defined' 
    clsHeader='text-gray-500' 
    clsReload='text-pink-500 text-3xl' 
  />

  <CapsulesView 
    onClick={onClick} 
    onRemove={onRemove}
    name_fn={
      d => d.handle
    }
    tags={discounts} className='mt-3' 
    clsCapsule='bg-pink-500' 
  />  
</div>
  )
}

export default OrderCouponInfo