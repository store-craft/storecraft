import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import FieldsView from '../comps/fields-view.jsx'
import { useCommonApiDocument } from '@/shelf-cms-react-hooks/index.js'
import ShowIf from '@/admin/comps/show-if.jsx'
import MDEditor from '@/admin/comps/md-editor.jsx'
import Media from '@/admin/comps/media.jsx'
import { MInput, Div, withCard, Handle } from '@/admin/comps/common-fields.jsx'
import TagsEdit from '@/admin/comps/tags-edit.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import EditMessage from '@/admin/comps/edit-message.jsx'
import SfProducts from '@/admin/comps/sf-products.jsx'
import { PromisableLoadingBlingButton } from '@/admin/comps/common-button.jsx'
import { MdPublish } from 'react-icons/md/index.js'
import { getSDK } from '@/admin-sdk/index.js'
import DocumentDetails from '@/admin/comps/document-details.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
import Attributes from '@/admin/comps/attributes.jsx'
import SelectResource from '@/admin/comps/select-resource.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
// import { DiscountApplicationEnum, 
//   StorefrontData } from '@/admin-sdk/js-docs-types'
import { CreateDate, HR, withBling } from '@/admin/comps/common-ui.jsx'
import { decode, encode } from '@/admin/utils/index.js'
import useNavigateWithState from '@/admin/hooks/useNavigateWithState.js'
import { DiscountApplicationEnum } from '@storecraft/core/v-api/types.api.enums.js'

const test = {
  title: 'storefront 1',
  handle: 'sf-main',
  desc : 'blah blah blah',
  products: [],
  collections : [],
  discounts: [],
  tags : [],
  updatedAt : 39203023,
  media : ['url1', 'url2'],
  notes : [ { msg : '', url:''} ]
}

const root_left_schema = {
  name:'Root', comp: Div, 
  comp_params : { className:'w-full lg:w-[34rem] flex flex-col gap-5'},
  fields: [
    { 
      key: 'title', name: 'Title', type: 'text',  validate: true, 
      editable: true, desc: 'Give your store a title', 
      comp: withCard(withBling(MInput), {className:'h-10'}),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'handle',  name: 'Handle',  type: 'text', validate: false, 
      editable: true, desc: 'An identifier for your store',
      comp: withCard(Handle, {className:'w-full h-fit'}),
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'products', name: 'Products', type: 'text', validate: false, 
      editable: true, desc: 'Decide which specific products are used by the Store Front',
      comp: withCard(SfProducts, {className:'h-10'}),  
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'collections', name: 'Collections', type: 'text', 
      validate: false, editable: true, 
      desc: 'Decide which collections meta data is used by the Store Front',
      comp: withCard(SelectResource, { 
        className:'w-full', add_all: true, resource: 'collections'
          }
        ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'discounts', name: 'Discounts', type: 'text', validate: false, 
      editable: true, desc: 'Decide which discounts are used by the Store Front',
      comp: withCard(SelectResource, { 
        className: 'w-full', add_all: true, resource: 'discounts',
        transform_fn: (w) => w.filter(
          it => it[1].application.id===DiscountApplicationEnum.Auto.id && it[1].enabled
          )
          }
        ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'shipping_methods', name: 'Shipping Methods', type: 'text', validate: false, 
      editable: true, desc: 'Decide which Shipping methods are used by the Store Front',
      comp: withCard(SelectResource, { 
        className: 'w-full', add_all: true, resource: 'shipping',
        name_fn: it => it[1].name
          }
        ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'posts', name: 'Posts', type: 'text', validate: false, 
      editable: true, desc: 'Decide which Notes / Posts are used by the Store Front',
      comp: withCard(SelectResource, { 
        className: 'w-full', add_all: true, resource: 'posts',
          }
        ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'desc', name: 'Description', type: 'text', 
      validate: false, editable: true, 
      comp: withCard(MDEditor),  
      comp_params: {className: 'w-full'} 
    },
    {
      key: 'media', name: 'Media', type: 'text',   
      validate: false, editable: true, desc: 'Manage and edit your media files',
      comp: withCard(Media), comp_params: {className: 'w-full '} 
    },
    {
      key: 'video', name: 'Video', type: 'text', validate: false, 
      editable: true, desc: 'Add a video url to your store front',
      comp: withCard(withBling(MInput), {className:'h-10'}),  
      comp_params: {className: 'w-full h-fit'} 
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
      key: 'tags', name: 'Tags', type: 'compund', validate: false, 
      editable: true, 
      desc: 'Tags help you attach extra attributes to your store',
      comp: withCard(TagsEdit) 
    },
    {
      key: 'attributes', name: 'Attributes', validate: false, 
      editable: true, 
      desc: 'Attributes can contain richer text values than tags',
      comp: withCard(Attributes),  
      comp_params: {className: 'w-full'} 
    },
  ]
}

const root_schema = {
  name:'Root', comp: Div, comp_params : { 
    className:`w-full --max-w-[35rem] --bg-red-100 items-center 
              lg:max-w-max lg:items-start lg:w-fit flex flex-col 
              lg:flex-row gap-5 mx-auto`},
  fields: [
    root_left_schema, root_right_schema
  ]
}

const Actions = ({ onClickSave=undefined, onClickCreate=undefined, 
                   onClickDelete=undefined, onClickPublish=undefined,
                   onClickDuplicate=undefined, onClickReload,
                   id, className }) => {
  return (
  <RegularDocumentActions 
        id={id} className={className}
        onClickCreate={onClickCreate} 
        onClickDelete={onClickDelete}
        onClickDuplicate={onClickDuplicate}
        onClickReload={onClickReload}
        onClickSave={onClickSave}>
      <PromisableLoadingBlingButton 
            Icon={<MdPublish/>} text='publish' 
            show={Boolean(onClickPublish)}
            onClick={onClickPublish} className='' />
  </RegularDocumentActions>  
  )
}

/**
 * @typedef {object} State
 * @property {import('@storecraft/core/v-api').StorefrontType} data
 * @property {boolean} hasChanged
 * 
 * @typedef {object} Context
 * @prop {() => State} getState
 */

export default ({ collectionId, 
                  mode, ...rest}) => {
  const { id : documentId, base } = useParams()
  const ref_root = useRef()
  const { 
    doc: doc_original, loading, hasLoaded, error, op,
    actions: { 
      reload, set, create, deleteDocument, colId, docId 
    }
  } = useCommonApiDocument(collectionId, documentId)
  const [externalErrors, setExternalErrors] = useState(undefined)

  const { 
    nav, navWithState, state 
  } = useNavigateWithState()

  const ref_head = useRef()
  const hasChanged = state?.hasChanged ?? false
  const isEditMode = mode==='edit'
  const isCreateMode = mode==='create'
  const isViewMode = !(isEditMode || isCreateMode)

  /**@type {StorefrontData} */
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
          handle: undefined,
          _published: undefined,
        },
        hasChanged: false
      }
      // ref_head.current.set(false)
      navWithState(`/pages/${collectionId}/create`, 
            state, state_next)
    }, [navWithState, collectionId, context]
  )

  const savePromise = useCallback(
    async (apply_navigation = true) => {
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      // console.log('final ', final);
      const [id, dd] = await set(final)
      if(apply_navigation)
        nav(`/pages/${collectionId}/${id}/edit`, { replace: true })
      return [id, dd]
    }, [set, doc, nav, collectionId]
  )

  const createPromise = useCallback(
    async () => {
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      // console.log('final ', final);
      const [id, _] = await create(final);
      nav(`/pages/${collectionId}/${id}/edit`, { replace: true })
    }, [create, doc, nav, collectionId]
  )

  const deletePromise = useCallback(
    async () => {
      await deleteDocument()
      nav(`/pages/${collectionId}`, { replace: true })
    }, [deleteDocument, nav, collectionId]
  )

  const publishPromise = useCallback(
    async () => {
      const [id, dd] = await savePromise(false)
      setExternalErrors(undefined)
      try {
        await getShelf().storefronts.publish(dd)
        await reload()
      } catch (e) {
        setExternalErrors(e.toString())
      }
    }, [savePromise, reload]
  )
  
  const key = useMemo(
    () => JSON.stringify(doc),
    [doc]
  )

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={[collectionId, documentId ?? 'create']} className='' />   
  <DocumentDetails doc={doc} className='mt-5' collectionId={collectionId}/>                     
  <Actions id={docId} className='mt-5'
           onClickSave={isEditMode ? savePromise : undefined}
           onClickCreate={isCreateMode ? createPromise : undefined}
           onClickPublish={!isCreateMode ? publishPromise : undefined}
           onClickDuplicate={!isCreateMode ? duplicate : undefined}
           onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
           onClickDelete={!isCreateMode ? deletePromise : undefined} />
  <CreateDate changes_made={hasChanged} ref={ref_head}  
              key={doc?.updatedAt}
              time={doc?.createdAt} className='mt-8' />            
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode}>
    <div className='w-full max-w-[40rem]  lg:w-fit lg:max-w-none mx-auto'>
      <EditMessage messages={error ?? externalErrors} className='w-full' />
      <FieldsView key={key} ref={ref_root} field={root_schema} 
                  value={ doc ?? {} } isViewMode={isViewMode} 
                  context={context}
                  className='mt-8' />      
    </div>                
  </ShowIf>
</div>
  )
}