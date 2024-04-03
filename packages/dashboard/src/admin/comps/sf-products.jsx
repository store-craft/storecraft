import { useCallback, useRef } from 'react'
import { BrowseProducts } from './browse-collection.jsx'
import CapsulesView from './capsules-view.jsx'
import { Overlay } from './overlay.jsx'
import { BlingButton } from './common-button.jsx'
import { HR } from './common-ui.jsx'
import useNavigateWithState from '@/admin/hooks/useNavigateWithState.js'

/**
 * 
 * @param {import('./fields-view.jsx').FieldLeafViewParams<
 *  import('@storecraft/core/v-api').ProductType[], 
 *  import('../pages/storefront.jsx').Context>} param0 
 * @returns 
 */
const SfProducts = ({ field, context, value=[], onChange }) => {
  
  /** @type {import('react').MutableRefObject<import('./overlay.jsx').ImpInterface>} */
  const ref_overlay = useRef()
  const { navWithState } = useNavigateWithState()

  const onRemove = useCallback(
    /**
     * @param {import('@storecraft/core/v-api').ProductType} v 
     */
    (v) => {
      const idx = value.indexOf(v)
      if(idx == -1) return
      value.splice(idx, 1)
      const new_vs = [...value]
      onChange(new_vs)
    },
    [field, value, onChange]
  )

  const onClick = useCallback(
    (v) => {
      const where = v.split('_')[0]
      navWithState(
        `/pages/products/${where}/edit`, 
        context?.getState()
        )
    },
    [navWithState, context]
  )

  const onBrowseAdd = useCallback(
    (selected_items) => { // array of shape [[id, data], ...]
      // map to handle/id
      const mapped = selected_items.map(it => it[0])
      // only include unseen handles
      const resolved = [
        ...mapped.filter(
          m => value.find(it => it===m)===undefined
        ), 
        ...value
      ];
      onChange(resolved)
      ref_overlay.current.hide()
    }, [field, value, onChange]
  )

  return (
<div className='w-full'>
  <BlingButton children='Browse products' 
                className='--w-fit h-10 w-40 mx-auto' 
                onClick={() => ref_overlay.current.show()}/>
  <Overlay ref={ref_overlay} >
    <BrowseProducts onSave={onBrowseAdd} 
                    onCancel={() => ref_overlay.current.hide()} />
  </Overlay>

  {
    value?.length>0 &&
    <HR className='my-5' />
  }

  <CapsulesView 
      onClick={onClick} 
      onRemove={onRemove} 
      tags={value} 
      className='mt-5' />
</div>
    )
  }

  export default SfProducts