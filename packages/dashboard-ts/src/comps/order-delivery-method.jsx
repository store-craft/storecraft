import { useCallback, useState } from 'react'
import { BlingInput, HR } from './common-ui.jsx'
import SelectResource from './select-resource.jsx'

/**
 * @typedef {import('./fields-view.jsx').FieldLeafViewParams<
 *  import('@storecraft/core/api').ShippingMethodType> & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } OrderDeliveryMethodParams
 * 
 * @param {OrderDeliveryMethodParams} param
 */
const OrderDeliveryMethod = (
  { 
    field, value, onChange, ...rest 
  }
) => {

  const [ v, setV ] = useState(value)
  const { key, comp_params } = field

  const onSelect = useCallback(
    /** @param {typeof value} t  */
    (t) => {
      setV(t)
      onChange(t)
    },
    [onChange]
  );

  return (
<div {...comp_params}>
  <SelectResource 
      resource='shipping' layout={1}
      className='mt-3' onSelect={onSelect}
      header='Pick Methods you defined' 
      clsHeader='shelf-text-minor' 
      clsReload='text-kf-500 text-3xl' 
      name_fn={
        /** @param {typeof value} ship */
        ship => ship.title
      } />

  <HR className='w-full mt-5' />
  <p children='Method' className='mt-2 shelf-text-minor'/>

  <BlingInput 
      stroke=''
      readOnly={true}
      className='mt-1 pointer-events-none'
      value={v?.title} 
      placeholder='Shipping Method' 
      type='text' />

  <p children='Price' className='mt-3 shelf-text-minor'/>
  <div className='flex flex-row items-center h-fit w-full mt-1'>

    <BlingInput 
        stroke=''
        readOnly={true}
        className='mt-1 w-full pointer-events-none'
        onWheel={(e) => e.target.blur()}
        value={v?.price} 
        placeholder='Price' 
        type='number' min='0' />

  </div>
</div>
  )
}

export default OrderDeliveryMethod