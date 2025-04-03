import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowseProducts } from './resource-browse.jsx'
import { Overlay } from './overlay.jsx'
import { Link } from 'react-router-dom'
import { IoCloseSharp } from 'react-icons/io5/index.js'
import { BlingButton } from './common-button.jsx'
import { HR, Label } from './common-ui.jsx'
import useNavigateWithState from '@/hooks/use-navigate-with-state.jsx'


/**
 * @param {object} param 
 * @param {import('@storecraft/core/api').ProductType} param.product
 * @param {import('./fields-view.jsx').FieldContextData} param.context
 * @param {() => void} param.onRemove
 */
const Item = (
  { 
    context, product, onRemove 
  }
) => {

  const { navWithState } = useNavigateWithState()

  const onClick = useCallback(
    () => {
      // const all = context?.query.all.get(false)?.data
      const state = context?.getState()
      navWithState(`/pages/products/${product.handle}`, state)
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
 * @param {import('./fields-view.jsx').FieldLeafViewParams<
 *  import('@storecraft/core/api').ProductType[]> &
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params 
 * 
 */
const RelatedProducts = (
  { 
    field, context, value=[], onChange, setError, ...rest 
  }
) => {

  const [products, setProducts] = useState(value ?? []);
  /** @type {React.MutableRefObject<import('./overlay.jsx').ImpInterface>} */
  const ref_overlay = useRef();

  const onBrowseAdd = useCallback(
    /**
     * @param {import('@storecraft/core/api').ProductType[]} selected_items 
     */
    (selected_items) => {
      const ps = [
        ...selected_items.filter(
            m => products.find(
              it => it.handle===m.handle
              )===undefined), 
        ...products
      ];

      setProducts(ps);


      console.log('pra', ps)

      onChange && onChange(ps);

      ref_overlay.current.hide();

    }, [products, onChange]
  );

  const onRemoveItem = useCallback(
    /**@param {string} handle  */
    (handle) => {
      const ps = products.filter(
        it => it.handle!==handle
        );

      setProducts(ps)
      onChange && onChange(ps)
    }, [products, onChange]
  )
  
  return (
<div {...rest}>
  <BlingButton children='Browse products'
      stroke='border-2'
      className='w-40 h-10 mx-auto'  
      onClick={() => ref_overlay.current.show()} />
  <Overlay ref={ref_overlay}>
    <BrowseProducts 
        onSave={onBrowseAdd} 
        onCancel={() => ref_overlay.current.hide()} />
  </Overlay>
  {
    products?.length>0 && 
    <HR className='mt-5'/>
  }
  
  {
    products.map(
      (it) => (
        <Item 
            key={it.handle} 
            product={it} 
            context={context}
            onRemove={() => onRemoveItem(it.handle)} />
      )
    )
  }
</div>
  )
}

export default RelatedProducts