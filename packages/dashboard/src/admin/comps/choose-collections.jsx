import { useCallback, useState } from 'react'
import SelectCollection, { default_name_fn, default_transform_fn } from './select-collection'
import CapsulesView from './capsules-view'
import { FieldContextData, FieldData } from './fields-view'
import { HR } from './common-ui'
import useNavigateWithState from '../hooks/useNavigateWithState'

const col2url = c => {
  switch(c) {
    case 'users': 
      return '/pages/customers'
    case 'payment_gateways': 
      return '/pages/payment-gateways'
    case 'shipping_methods': 
      return '/pages/shipping-methods'
    case 'posts': 
      return '/apps/blog'
      
    default:
      return `/pages/${c}`
  }
}

/**
 * @param {object} p 
 * @param {FieldData} p.field
 * @param {FieldContextData} p.context
 * @param {any} p.value
 * @param {() => void} p.onChange
 * @param {boolean} p.add_all
 * @param {string} p.className
 * @param {string} p.collectionId the id of the collection
 * @param {string} p.label the label
 */
const ChooseCollections = 
  ({ field, context, value, onChange, collectionId, add_all=false, 
     transform_fn=default_transform_fn,
     name_fn=default_name_fn,
     label='Select', className, ...rest }) => {
  
  const { navWithState } = useNavigateWithState()

  const [tags, setTags] = useState(Array.isArray(value) ? value : [])
  // console.log('value ', value)
  const onAdd = useCallback(
    (t) => {
      const isAll = t==='ALL'
      // console.log('t ', t)
      t = isAll ? t : t[0] // id or handle of collection

      if(tags.indexOf(t)!=-1)
        return

      const new_tags = isAll ? [t] : [ ...tags.filter(tt => tt!=='ALL'), t]
      onChange(new_tags)
      setTags(new_tags)
    },
    [tags, onChange]
  )
  
  const onRemove = useCallback(
    (v) => {
      const idx = tags.indexOf(v)
      if(idx == -1) return
      tags.splice(idx, 1)
      const new_tags = [...tags]
      onChange(new_tags)
      setTags(new_tags)
    },
    [tags, onChange]
  )
  
  const onClick = useCallback(
    (v) => {
      if(v==='ALL')
        return
      const where = v.split('_')[0]
      navWithState(
        `${col2url(collectionId)}/${where}/edit`, 
        context?.getState()
        )
    },
    [navWithState, context, collectionId]
  )

  return (
<div className={className}>
  <SelectCollection 
              transform_fn={transform_fn}
              name_fn={name_fn}
              add_all={add_all}
              collectionId={collectionId}
              onSelect={onAdd} layout={1} 
              className='mt-3' clsReload='text-kf-500 text-3xl' 
              header={label} />

  {
    tags?.length>0 &&
    <HR className='my-5' />
  }

  <CapsulesView tags={tags} 
                onClick={onClick} 
                onRemove={onRemove} 
                clsCapsule='bg-kf-500' 
                className='--mt-3' />
</div>
  )
  }

export default ChooseCollections