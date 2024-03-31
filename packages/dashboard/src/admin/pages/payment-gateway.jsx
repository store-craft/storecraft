import { useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import FieldsView from '@/admin/comps/fields-view.jsx'
import { useCommonApiDocument } from '@/shelf-cms-react-hooks/index.js'
import ShowIf from '@/admin/comps/show-if.jsx'
import { 
  MInput, Div, withCard, 
  } from '@/admin/comps/common-fields.jsx'
import TagsEdit from '@/admin/comps/tags-edit.jsx'
import ChooseCollections from '@/admin/comps/choose-collections.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
import EditMessage from '@/admin/comps/edit-message.jsx'
import DocumentDetails from '@/admin/comps/document-details.jsx'
import Attributes from '@/admin/comps/attributes.jsx'
import RelatedProducts from '@/admin/comps/product-related-products.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import { useMemo } from 'react'
import { decode, encode } from '@/admin/utils/index.js'
import { CreateDate, HR, withBling } from '@/admin/comps/common-ui.jsx'
import useNavigateWithState from '@/admin/hooks/useNavigateWithState.js'
// import { PaymentGatewayData } from '@/admin-sdk/js-docs-types'

const root_left_schema = {
  name:'Root', comp: Div, 
  comp_params : { className:'w-full lg:w-[37rem] flex flex-col gap-5'},
  fields: [
    { 
      key: 'title', name: 'Title', type: 'text',  validate: true, editable: true, 
      desc: 'A short title for your payment gateway flow',
      comp: withCard(withBling(MInput), { className:'h-10' }, true, true),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'id',  name: 'Gateway ID',  type: 'text', validate: false, editable: true, 
      comp: withCard(withBling(MInput), {className:'w-full h-10'}),
      desc: 'Uniquely identify your payment gateway flow at the backend',
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'attributes', name: 'Attributes', validate: false, editable: true, 
      desc: 'Attributes can contain richer text values than tags',
      comp: withCard(Attributes),  
      comp_params: {className: 'w-full'} 
    },
    {
      name: 'JSON', type: 'compund', validate: false, editable: false, 
      desc: 'Observe the RAW data',
      comp: JsonViewCard,
      comp_params: { className: 'w-full' }
    },
  ]
}

const root_right_schema = {
  name:'Root2', comp: Div, 
  comp_params : { className:'w-full lg:w-[19rem] flex flex-col gap-5'},
  fields: [
    { 
      key: 'related_products', name: 'Related Products', type: 'compund',  validate: false, editable: true, 
      desc: 'Which other products are similar ? Offer your customers similar products',
      comp: withCard(RelatedProducts) 
    },
    { 
      key: 'tags', name: 'Tags', type: 'compund',  validate: false, editable: true, 
      desc: 'Tags help you attach attributes to products',
      comp: withCard(TagsEdit),
    },
    { 
      key: 'collections', name: 'Collections', type: 'compund',  validate: false, editable: true, 
      desc: 'Which collections does this product belong to ?',
      comp: withCard(ChooseCollections, {collectionId: 'collections'}) 
    },
    
  ]
}

const root_schema = {
  name:'Root', comp: Div, comp_params : { 
    className:'w-full --max-w-[35rem] --bg-red-100 items-center \
              lg:max-w-max lg:items-start lg:w-fit flex flex-col \
              lg:flex-row gap-5 mx-auto'},
  fields: [
    root_left_schema
  ]
}

/**
 * @typedef {object} State
 * @property {PaymentGatewayData} data
 * @property {boolean} hasChanged
 */

export default ({ collectionId, 
                  mode, segment, ...rest}) => {

  const { id : documentId, base } = useParams()
  const ref_root = useRef()
  const { 
    doc: doc_original, loading, hasLoaded, error, op,
    actions: { 
      reload, set, create, deleteDocument, colId, docId 
    }
  } = useCommonApiDocument(collectionId, documentId)

  const { 
    nav, navWithState, state 
  } = useNavigateWithState()

  const ref_head = useRef()
  const hasChanged = state?.hasChanged ?? false
  const isEditMode = mode==='edit'
  const isCreateMode = mode==='create'
  const isViewMode = !(isEditMode || isCreateMode)

  /**@type {OrderData} */
  const doc = useMemo(
    () => {
      let base_o = {}
      try {
        base_o = base ? decode(base) : {}
      } catch (e) {}
      const doc = { ...base_o, ...doc_original, ...state?.data }
      return doc
    }, [doc_original, base, state]
  )

  const context = useMemo(
    () => ({
      /**@returns {State} */
      getState: () => {
        const data = ref_root.current.get(false)?.data
        const hasChanged = Boolean(ref_head.current.get())
        return {
          data, hasChanged
        }
      }
    }), []
  )

  const duplicate = useCallback(
    async () => {
      const state = context.getState()
      /**@type {State} */
      const state_next = { 
        data: { 
          ...state?.data,
          updatedAt: Date.now(),
          createdAt: undefined,
          search: undefined,
          id: undefined
        },
        hasChanged: false
      }
      // ref_head.current.set(false)
      navWithState(`/pages/${segment}/create`, 
            state, state_next)
    }, [navWithState, segment, context]
  )

  const savePromise = useCallback(
    async () => {
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      // console.log('final ', final);
      const [id, _] = await set(final)
      nav(`/pages/${segment}/${id}/edit`, { replace: true })
    }, [set, doc, nav, segment]
  )

  const createPromise = useCallback(
    async () => {
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      // console.log('final ', final);
      const [id, _] = await create(final);
      nav(`/pages/${segment}/${id}/edit`, { replace: true })
    }, [create, doc, nav, segment]
  )

  const deletePromise = useCallback(
    async () => {
      await deleteDocument()
      nav(`/pages/${segment}`, { replace: true })
    }, [deleteDocument, nav, segment]
  )

  const key = useMemo(
    () => JSON.stringify(doc),
    [doc]
  )

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={['Payment Gateway Config', documentId ?? 'create']} className='' />  
  <DocumentDetails doc={doc} className='mt-5' collectionId={collectionId}/>                     
  <RegularDocumentActions             
             onClickSave={isEditMode ? savePromise : undefined}
             onClickCreate={isCreateMode ? createPromise : undefined}
             onClickDelete={!isCreateMode ? deletePromise : undefined} 
             onClickDuplicate={!isCreateMode ? duplicate : undefined}
             onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
             id={docId}
             className='mt-5'/>
  <CreateDate changes_made={hasChanged} ref={ref_head}  
              key={doc?.updatedAt}
              time={doc?.createdAt} className='mt-8' />            
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode} className='mt-8'>
    <div className='w-full max-w-[40rem] lg:w-fit lg:max-w-none mx-auto'>
      <EditMessage messages={error} classname='w-full' />
      <FieldsView key={key} ref={ref_root} 
                  field={root_schema} 
                  value={ doc ?? {} } 
                  context={context}
                  isViewMode={isViewMode} className='mt-8' />      
    </div>                
  </ShowIf>
</div>
  )
}