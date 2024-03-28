import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowseProducts } from './browse-collection'
import { Overlay } from './overlay'
import { Link } from 'react-router-dom'
import { IoCloseSharp } from 'react-icons/io5'
import { ProductData } from '../../admin-sdk/js-docs-types'
import { BlingButton } from './common-button'
import { HR, Label } from './common-ui'
import { FieldContextData, FieldData } from './fields-view'
import useNavigateWithState from '../hooks/useNavigateWithState'


/**
 * @param {object} param0 
 * @param {ProductData} param0.product
 * @param {FieldContextData} param0.context
 * @param {(products) => void}} param0.onRemove
 */
const Item = ({ context, product, onRemove }) => {

  const { navWithState } = useNavigateWithState()

  const onClick = useCallback(
    () => {
      // const all = context?.query.all.get(false)?.data
      const state = context?.getState()
      navWithState(`/pages/products/${product.handle}/edit`, state)
    },
    [navWithState, product, context]
  )

  return (
<div className='w-full flex flex-row justify-between 
                items-center py-3 border-b shelf-border-color'>
  <Label >
    <a onClick={onClick} className='cursor-pointer' >
      <span children={product?.title} />                  
    </a>
  </Label>

  <IoCloseSharp 
      className='cursor-pointer h-6 w-9 pl-3 
                 border-l shelf-border-color 
                 flex-shrink-0' 
      onClick={onRemove} />
</div>    
  )
}

/**
 * 
 * @param {object} param0 
 * @param {FieldData} param0.field
 * @param {string[]} param0.value
 * @param {FieldContextData} param0.context
 * @param {(v: string[]) => any} param0.value
 */
const RelatedProducts = 
  ({ field, context, value=[], onChange, className, ...rest }) => {

  /**@type {[products: ProductData[]]} */
  const [products, setProducts] = useState(value ?? [])
  const ref_overlay = useRef()

  const onBrowseAdd = useCallback(
    /**
     * @param {[id: string, product: ProductData][]} selected_items 
     */
    (selected_items) => {
      const ps = [
        ...selected_items.map(
          it => it[1]).filter(
            m => products.find(
              it => it.handle===m.handle
              )===undefined), 
        ...products
      ]
      setProducts(ps)
      onChange && onChange(ps)
      ref_overlay.current.hide()
    }, [products, onChange]
  )

  const onRemoveItem = useCallback(
    /**@param {string} handle  */
    (handle) => {
      const ps = products.filter(
        it => it.handle!==handle
        )

      setProducts(ps)
      onChange && onChange(ps)
    }, [products, onChange]
  )
  
  return (
<div className={className}>
  <BlingButton children='Browse products'
      stroke='p-0.5'
      className='w-40 h-10 mx-auto'  
      onClick={() => ref_overlay.current.show()} />
  <Overlay ref={ref_overlay} >
    <BrowseProducts onSave={onBrowseAdd} 
                    onCancel={() => ref_overlay.current.hide()} />
  </Overlay>
  {
    products?.length>0 && 
    <HR className='mt-5'/>
  }
  
  {
    products.map(
      (it) => <Item key={it.handle} product={it} context={context}
                    onRemove={() => onRemoveItem(it.handle)} />
    )
  }
</div>
  )
}

export default RelatedProducts