import { useCallback, useRef } from 'react'
import { BrowseProducts } from './resource-browse.jsx'
import CapsulesView from './capsules-view.jsx'
import { Overlay } from './overlay.jsx'
import { BlingButton } from './common-button.jsx'
import { HR } from './common-ui.jsx'
import useNavigateWithState from '@/admin/hooks/useNavigateWithState.js'

/**
 * `StorefrontProducts` is located at the `storefront.jsx` page.
 * It consists of abutton, that opens a modal to query `products`
 * with pagination and selecting them.
 * 
 * @param {import('./fields-view.jsx').FieldLeafViewParams<
 *  import('@storecraft/core/v-api').ProductType[], 
 *  import('../pages/storefront.jsx').Context>} params 
 * 
 */
const StorefrontProducts = ({ field, context, value=[], onChange }) => {
  
  /** @type {React.MutableRefObject<import('./overlay.jsx').ImpInterface>} */
  const ref_overlay = useRef()
  const { navWithState } = useNavigateWithState()

  const onRemove = useCallback(
    /**
     * @param {import('@storecraft/core/v-api').ProductType} v 
     */
    (v) => {
      onChange(value.filter(pr => pr.handle!==v.handle));
    },
    [value, onChange]
  );

  /**
   * Clicking a capsule will lead to item page
   */
  const onClick = useCallback(
    /**
     * @param {import('@storecraft/core/v-api').ProductType} v 
     */
    (v) => {
      const where = v.handle ?? v.id;
      navWithState(
        `/pages/products/${where}`, 
        context?.getState()
      );
    },
    [navWithState, context]
  );

  const onBrowseAdd = useCallback(
    /**
     * @param {import('@storecraft/core/v-api').ProductType[]} selected_items 
     */
    (selected_items) => { 
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
         * @param {import('@storecraft/core/v-api').ProductType} pr 
         */
        pr => pr.title
      }
      tags={value} 
      className='mt-5' />
</div>
    )
  }

  export default StorefrontProducts