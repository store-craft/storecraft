import { BottomActions } from './collection-actions.jsx'
import CollectionView from './collection-view.jsx'
import { RecordActions, Span, 
  TimeStampView } from './common-fields.jsx'
import { Bling, Card } from './common-ui.jsx'
import { useCommonCollection } from '@/shelf-cms-react-hooks/index.js'
import { forwardRef, useCallback, useEffect, 
         useImperativeHandle, useMemo, 
         useRef, useState } from 'react'
import { getSDK } from '@/admin-sdk/index.js'
import useTrigger from '@/shelf-cms-react-hooks/common/useTrigger.js'
import ShowIf from './show-if.jsx'
import { IoMdAdd } from 'react-icons/io/index.js'
import { Overlay } from './overlay.jsx'
import { BrowseProducts } from './browse-collection.jsx'
// import { CollectionData } from '@/admin-sdk/js-docs-types'
import { FieldContextData } from './fields-view.jsx'

const CollectionBase = forwardRef(
  /**
   * 
   * @param {object} param0 
   * @param {string} param0.collection_term
   * @param {number} param0.limit
   * @param {(count: number) => void} param0.onLoaded when loaded reports query count
   * @param {FieldContextData} param0.context context
   * @param {object} ref 
   */
  ({ collection_term, limit=5, context, onLoaded, ...rest}, ref) => {
    
  const { 
    pages, page, loading, error, 
    prev, next, query, queryCount 
  } = useCommonCollection('products', false)
  const trigger = useTrigger()

  const schema = useRef([
    { key: 'title', name: 'Title', comp: Span },
    { key: 'updatedAt', name: 'Last Updated', comp: TimeStampView },
    { key: undefined, name: 'Actions', comp: RecordActions },
  ])

  useEffect(
    () => {
      onLoaded && onLoaded(queryCount)
    }, [queryCount, onLoaded]
  )

  useEffect(() => {
    query({ search: `col:${collection_term}`, limit})
  }, [collection_term, query, limit])

  useImperativeHandle(ref, 
    () => (
      {
        refresh : () => query(
          { 
            search: `col:${collection_term}`, 
            limit
          })
      }
    ), 
    [query, collection_term, limit]
  )

  const context2 = useMemo(
    () => (
      {
        editDocumentUrl: id => `../../products/${id}/edit`,
        getState: () => {
          return context?.getState()
        },
        deleteDocument: async id => {
          await getSDK().products.batchRemoveProductsFromCollection(
            [id], collection_term
            )
          const index = page.findIndex(it => it[0]===id)
          page.splice(index, 1)
          trigger()
        }
      }
    ), [trigger, page, context]
  )

  return (
<>
  <CollectionView context={context2} data={page} 
                  fields={schema.current} />
  <BottomActions prev={prev} next={next} 
                  onLimitChange={undefined} />
</>
  )
})

/**
 * 
 * @param {object} param0 
 * @param {CollectionData} param0.value collection
 * @param {string} param0.docId collection handle
 * @param {FieldContextData} param0.context context
 */
const ProductsInCollection = ({ docId, value, context }) => {
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(-1)
  const [error, setError] = useState(undefined)
  const ref_overlay = useRef()
  const ref_productsByCollection = useRef()

  docId = value?.handle ?? docId

  const onBrowseAdd = useCallback(
    async (selected_items) => { // array of shape [[id, data], ...]
      // map to handle/id
      setLoading(true)

      try {
        // Add products to collection through collection and search fields
        await getShelf().products
                       .batchAddProductsToCollection(selected_items, docId)
        ref_productsByCollection.current.refresh()
      }
      catch (err) {
        setError(error)
      }
      finally {
        setLoading(false)
      }

      ref_overlay.current.hide()
    }, [error, docId]
  )

  return (
<Card name={`Products in collection ${count>=0 ? `(${count})` : ''}` }
      className='w-full --lg:w-[30rem] h-fit' 
      border={true}
      error={error}>
  <ShowIf show={docId}>
    <CollectionBase ref={ref_productsByCollection} 
                    collection_term={docId} 
                    context={context}
                    onLoaded={setCount}
                    className='text-sm h-fit' />          
    <div className='flex flex-row justify-end'>
      <div className='flex flex-row items-center w-fit gap-3 mt-7'>
        <span children='Add Product' className='text-gray-500' />
        <Bling className='text-gray-500 text-sm w-fit mx-auto 
                        shadow-gray-800/25 shadow-lg hover:scale-110 
                        transition-transform cursor-pointer' 
              stroke='p-0.5' rounded='rounded-full'
              from='from-pink-500' to='to-kf-400'
              onClick={() => !loading && ref_overlay.current.show()}>
          <IoMdAdd className={'text-4xl text-white ' + 
                        (loading ? 'animate-spin' : '')} />
        </Bling>
      </div>
    </div>

    <Overlay ref={ref_overlay} >
      <BrowseProducts onSave={onBrowseAdd} 
                      onCancel={() => ref_overlay.current.hide()} />
    </Overlay>
  </ShowIf>
  <ShowIf show={!docId}>
    <p children='Only after Collection is created, 
                you will be able to add products here'
       className='text-2xl font-semibold text-gray-400' />
  </ShowIf>
</Card>
  )
}

export default ProductsInCollection
