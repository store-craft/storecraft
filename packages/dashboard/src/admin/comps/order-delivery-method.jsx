import { useCallback, useState } from 'react'
import { BlingInput, HR } from './common-ui.jsx'
import SelectCollection from './select-collection.jsx'

/**
 * @typedef {import('./fields-view.jsx').FieldLeafViewParams<
 *  import('@storecraft/core/v-api').ShippingMethodType> & 
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

  const onUpdateName = useCallback(
    (e) => {
      const name = String(e.currentTarget.value)
      const vnew = {
        ...v, name
      }     
      setV(vnew)
      onChange(vnew)
    }, [v, onChange]
  )
  
  const onUpdatePrice = useCallback(
    (e) => {
      const price = parseFloat(e.currentTarget.value)
      const vnew = {
        ...v, price
      }
      setV(vnew)
      onChange(vnew)
    }, [v, onChange]
  )
  
  const onSelect = useCallback(
    /** @param {typeof value} t  */
    (t) => {
      // console.log('rrr ', t)
      // const { name, price } = t[1]
      setV(t)
      // setName(name)
      // setPrice(price)
      onChange(t)
    },
    [onChange]
  )

  return (
<div {...comp_params}>
  <SelectCollection 
      collectionId='shipping_methods' layout={1}
      className='mt-3' onSelect={onSelect}
      header='Pick Methods you defined' 
      clsHeader='shelf-text-minor' 
      clsReload='text-kf-500 text-3xl' 
      name_fn={
        /** @param {typeof value} ship */
        ship => ship.title
      } />

  <HR className='w-full mt-3' />
  <p children='Method' className='mt-2 shelf-text-minor'/>

  <BlingInput className='mt-1'
              onChange={onUpdateName} 
              value={v?.title} 
              placeholder='Shipping Method' type='text' />

  <p children='Price' className='mt-3 shelf-text-minor'/>
  <div className='flex flex-row items-center h-fit w-full mt-1'>

    <BlingInput className='mt-1 w-full'
                onWheel={(e) => e.target.blur()}
                onChange={onUpdatePrice}
                value={v?.price} placeholder='Price' 
                type='number' min='0' />

  </div>
</div>
  )
}

export default OrderDeliveryMethod