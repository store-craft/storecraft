import { useCallback, useRef } from 'react'
import { BrowseProducts } from './resource-browse'
import CapsulesView from './capsules-view'
import { Overlay } from './overlay'
import { BlingButton } from './common-button'
import { HR } from './common-ui'
import useNavigateWithState from '@/hooks/use-navigate-with-state'
import { FieldLeafViewParams } from './fields-view'
import { ProductType } from '@storecraft/core/api'

export type StorefrontProductsParams = FieldLeafViewParams<
  ProductType[], 
  import('../pages/storefront.jsx').Context
>;

/**
 * `StorefrontProducts` is located at the `storefront.jsx` page.
 * It consists of abutton, that opens a modal to query `products`
 * with pagination and selecting them.
 * 
 */
const StorefrontProducts = (
  { 
    field, context, value=[], onChange 
  }: StorefrontProductsParams
) => {
  
  const ref_overlay = useRef<import('./overlay.jsx').ImpInterface>(null)
  const { navWithState } = useNavigateWithState()

  const onRemove = useCallback(
    (v: ProductType) => {
      onChange(value.filter(pr => pr.handle!==v.handle));
    },
    [value, onChange]
  );

  /**
   * Clicking a capsule will lead to item page
   */
  const onClick = useCallback(
    (v: ProductType) => {
      const where = v.handle ?? v.id;
      navWithState(
        `/pages/products/${where}`, 
        context?.getState()
      );
    },
    [navWithState, context]
  );

  const onBrowseAdd = useCallback(
    (selected_items: ProductType[]) => { 
      // only include unseen handles
      const resolved = [
        ...selected_items.filter(
          pr => !value.find(it => it.handle===pr.handle)
        ), 
        ...value
      ];
      onChange(resolved)
      ref_overlay.current.hide()
    }, [value, onChange]
  );

  return (
<div className='w-full'>
  <BlingButton 
    children='Browse products' 
    className='--w-fit h-10 w-40 mx-auto' 
    onClick={() => ref_overlay.current.show()}/>
  <Overlay ref={ref_overlay} >
    <BrowseProducts 
      onSave={onBrowseAdd} 
      onCancel={() => ref_overlay.current.hide()} />
  </Overlay>

  {
    value?.length>0 &&
    <HR className='my-5' />
  }

  <CapsulesView 
    onClick={onClick} 
    onRemove={onRemove}
    name_fn={
      /**
       * @param {import('@storecraft/core/api').ProductType} pr 
       */
      pr => pr.title
    }
    tags={value} 
    className='mt-5' 
  />
</div>
  )
}

export default StorefrontProducts