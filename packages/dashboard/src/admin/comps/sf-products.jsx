import { useCallback, useRef } from 'react'
import { BrowseProducts } from './browse-collection'
import CapsulesView from './capsules-view'
import { Overlay } from './overlay'
import { BlingButton } from './common-button'
import { HR } from './common-ui'
import { FieldContextData, FieldData } from './fields-view'
import useNavigateWithState from '../hooks/useNavigateWithState'

/**
 * 
 * @param {object} p
 * @param {FieldData} p.field
 * @param {string[]} p.value
 * @param {FieldContextData} p.context
 * @param {(handles: string[]) => void} p.onChange
 */
const SfProducts = ({ field, context, value=[], onChange }) => {
    const ref_overlay = useRef()
    const { navWithState } = useNavigateWithState()

    const onRemove = useCallback(
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
        const resolved = [...mapped.filter(m => value.find(it => it===m)===undefined), ...value]
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