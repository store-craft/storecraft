import { BottomActions } from './collection-actions.jsx'
import CollectionView from './collection-view.jsx'
import { RecordActions, Span, 
  TimeStampView } from './common-fields.jsx'
import { Bling, Card } from './common-ui.jsx'
import { q_initial, useCollection, useStorecraft } from '@storecraft/sdk-react-hooks'
import { forwardRef, useCallback, useEffect, 
         useImperativeHandle, useMemo, 
         useRef, useState } from 'react'
import ShowIf from './show-if.jsx'
import { IoMdAdd } from 'react-icons/io/index.js'
import { Overlay } from './overlay.jsx'
import { BrowseProducts } from './browse-collection.jsx'
import useTrigger from '../hooks/useTrigger.js'

const CollectionBase = forwardRef(
  /**
   * @typedef {object} ImpInterface
   * @prop {() => Promise<void>} refresh
   * 
   * @typedef {object} CollectionBaseParams
   * @prop {string} collection_handle_or_id `handle` or `id`
   * @prop {number} limit `limit` of query
   * @prop {(count: number) => void} onLoaded when loaded reports query count
   * @prop {import('./fields-view.jsx').FieldContextData<
   *  import('@storecraft/core/v-api').CollectionType> & 
   *  import('../pages/collection.jsx').Context
   * } context context
   * 
   * 
   * @param {CollectionBaseParams} param
   * @param {any} ref
   * 
   */
  (
    { 
      collection_handle_or_id, limit=5, context, onLoaded, ...rest
    }, ref
  ) => {

  const { sdk } = useStorecraft();
    
  /**
   * @type {import('@storecraft/sdk-react-hooks').useCollectionHookReturnType<
   *  import('@storecraft/core/v-api').ProductType>
   * }
   */
  const { 
    pages, page, loading, error, queryCount,
    actions: {
      prev, next, query
    }
  } = useCollection(
    `collections/${collection_handle_or_id}/products`, 
    q_initial, false
  );

  const trigger = useTrigger();

  const schema = useRef([
    { key: 'title', name: 'Title', comp: Span },
    { key: 'updated_at', name: 'Last Updated', comp: TimeStampView },
    { key: undefined, name: 'Actions', comp: RecordActions },
  ]);

  useEffect(
    () => {
      onLoaded && onLoaded(queryCount)
    }, [queryCount, onLoaded]
  );

  useEffect(
    () => {
      query({ limit: limit, sortBy: ['updated_at', 'id'] })
    }, [query, limit]
  );

  useImperativeHandle(ref, 
    () => (
      {
        refresh : () => query({ limit })
      }
    ), 
    [query, limit]
  );

  const context_collection_view = useMemo(
    () => (
      {
        getState: () => context?.getState(),
        /**
         * @param {string} id 
         */
        editDocumentUrl: id => `/pages/products/${id}/edit`,
        /**
         * @param {string} id_or_handle product `id` or `handle`
         */
        deleteDocument: async (id_or_handle) => {
          const pr_index = page.findIndex(
            it => (it.id===id_or_handle || it.handle===id_or_handle)
          );
          if(pr_index==-1)
            return;

          const col = context.data;
          const pr = page[pr_index];
          await sdk.products.batchRemoveProductsFromCollection(
            [pr], col
          );
          page.splice(pr_index, 1);
          trigger();
        }
      }
    ), [trigger, page, context]
  );

  return (
<>
  <CollectionView 
      context={context_collection_view} 
      data={page} 
      fields={schema.current} />
  <BottomActions 
      prev={prev} 
      next={next} 
      onLimitChange={undefined} />
</>
  )
})

/**
 * `ProductsInCollection` wraps and show the `products` of a given
 * collection with pagination.
 * 
 * @param {import('./fields-view.jsx').FieldLeafViewParams<
 *  import('@storecraft/core/v-api').CollectionType,
 *  import('../pages/collection.jsx').Context>
 * } param
 */
const CollectionProducts = ({ value, context }) => {

  const { sdk } = useStorecraft();
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(-1)
  const [error, setError] = useState(undefined)
  /** 
   * @type {React.MutableRefObject<
   *  import('./overlay.jsx').ImpInterface>
   * } 
   **/
  const ref_overlay = useRef();
  /** @type {React.MutableRefObject<ImpInterface>} */
  const ref_productsByCollection = useRef()

  const onBrowseAdd = useCallback(
    /**
     * 
     * @param {import('@storecraft/core/v-api').ProductType[]} selected_items 
     */
    async (selected_items) => {
      setLoading(true)

      try {
        // Add products to collection through collection and search fields
        await sdk.products.batchAddProductsToCollection(
          selected_items, value
        );
        ref_productsByCollection.current.refresh()
      }
      catch (err) {
        setError(error)
      }
      finally {
        setLoading(false)
      }

      ref_overlay.current.hide()
    }, [error, value?.handle]
  )

  return (
<Card 
    name={'Products in collection ' + (count>=0 ? count : '') }
    className='w-full --lg:w-[30rem] h-fit' 
    border={true}
    error={error}>
  <ShowIf show={value?.handle}>
    <CollectionBase 
        ref={ref_productsByCollection} 
        collection_handle_or_id={value?.handle} 
        context={context}
        onLoaded={setCount}
        className='text-sm h-fit' />          
    <div className='flex flex-row justify-end'>
      <div className='flex flex-row items-center w-fit gap-3 mt-7'>
        <span children='Add Product' className='text-gray-500' />
        <Bling 
            className='text-gray-500 text-sm w-fit mx-auto 
                        shadow-gray-800/25 shadow-lg hover:scale-110 
                        transition-transform cursor-pointer' 
            stroke='border-2' rounded='rounded-full'
            from='from-pink-500' to='to-kf-400'
            onClick={() => !loading && ref_overlay.current.show()}>
          <IoMdAdd className={'text-4xl text-white ' + 
                        (loading ? 'animate-spin' : '')} />
        </Bling>
      </div>
    </div>

    <Overlay ref={ref_overlay} >
      <BrowseProducts 
          onSave={onBrowseAdd} 
          onCancel={() => ref_overlay.current.hide()} />
    </Overlay>
  </ShowIf>
  <ShowIf show={!value?.handle}>
    <p children='Only after Collection is created, 
                you will be able to add products here'
       className='text-2xl font-semibold text-gray-400' />
  </ShowIf>
</Card>
  )
}

export default CollectionProducts
