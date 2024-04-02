import { getSDK } from '@/admin-sdk/index.js'
import { useRef, useEffect, useCallback, 
  useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import FieldsView from '@/admin/comps/fields-view.jsx'
import { useCommonApiDocument } from '@/shelf-cms-react-hooks/index.js'
import { CreateDate, HR, withBling } from '@/admin/comps/common-ui.jsx'
import { Div, MInput, withCard, 
         create_select_view,
         Switch,
         Handle} 
         from '@/admin/comps/common-fields.jsx'
         import ShowIf from '@/admin/comps/show-if.jsx'
import DiscountFilters, { discount_filters_validator } 
       from '@/admin/comps/discount-filters.jsx'
import DiscountDetails, { discount_details_validator } 
       from '@/admin/comps/discount-details.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import EditMessage from '@/admin/comps/edit-message.jsx'
import Media from '@/admin/comps/media.jsx'
import { PromisableLoadingBlingButton } from '@/admin/comps/common-button.jsx'
import { BiAddToQueue } from 'react-icons/bi/index.js'
import DocumentDetails from '@/admin/comps/document-details.jsx'
import TagsEdit from '@/admin/comps/tags-edit.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
// import { DiscountApplicationEnum, DiscountData } from '@/admin-sdk/js-docs-types'
import Attributes from '@/admin/comps/attributes.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import MDEditor from '@/admin/comps/md-editor.jsx'
import { decode, encode } from '@/admin/utils/index.js'
import useNavigateWithState from '@/admin/hooks/useNavigateWithState.js'
import { DiscountApplicationEnum } from '@storecraft/core/v-api/types.api.enums.js'

const validator_code = v => {
  if(v===undefined)
    return [false, 'Empty Code']
  const has_space = (/\s/g.test(v))

  if(has_space)
    return [false, 'Code cannot contain whitespace/s']
  return [true, undefined]
}

const info = {
  key: 'info', name:'Info', comp: Div, comp_params : { 
    className:'w-full flex flex-col gap-5'}, validate:false,  
  fields: [
    {
      key: 'filters', name: 'Filters', validate: true, 
      validator : discount_filters_validator, 
      desc: 'Define which products or orders (by date, amount or cutomers) are legible for discount',
      comp: withCard(DiscountFilters, { className: 'w-full h-9'}, true),
      comp_params: {className: 'w-full'}
    },
    {
      key: 'details', name: 'Discount Details', validate: true, 
      validator : discount_details_validator,
      desc: 'Choose the type of discount and its behaviour',
      comp: withCard(DiscountDetails, { className: 'w-full h-9'}, true),
      comp_params: {className: 'w-full'}
    },
  ]
}

const left = {
  name:'Main', comp: Div, 
  comp_params : { 
    className:`w-full --max-w-[35rem] gap-5 items-center 
               lg:items-start lg:w-[35rem] flex flex-col `
  },
  fields: [
    {
      key: 'title', name: 'Title', type: 'text', validate: true, 
      desc : 'A short and catchy title: 10% OFF for Orders above 100$' ,
      comp: withCard(withBling(MInput), { className: 'w-full h-10'}, true),
      comp_params: {className: 'w-full'}
    },
    { 
      key: 'code', name: 'Discount Code', type: 'text', validate: true, 
      validator: validator_code, editable: true, 
      desc: 'A short word identifier for the discount' ,
      comp: withCard(Handle, { 
        className: 'w-full h-fit', type: 'text', placeholder: 'code ...'
      }), 
      comp_params: { className: 'w-full text-xs py-auto --font-semibold' } 
    },
    info,
    { 
      key: 'media', name: 'Media', type: 'text', 
      desc: 'Manage and edit your media files' ,validate: false, editable: true, 
      comp: withCard(Media),  comp_params: {className: 'w-full'} 
    },
    {
      key: 'desc', name: 'Description', type: 'text', validate: false, 
      desc: 'Optional description',
      comp: withCard(MDEditor),
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

const desc_order = 'Order determines the order in which automatic discounts are applied. \nDiscounts are \
                    arranged as a stack and the order of application is important. \n\n\
                    For Example, \
                    A discount with a 0 order will be applied before a discount with order 10. \
                    \n\nFree Shipping for orders above say 100$ should be applied last and therefore should \
                    have a high order number'

const desc_type = 'Decide whether the discount is: \
                  \n- Automatically applied, or\
                  \n- Coupon (applied by user) .\
                  '

const right = {
  name:'Main', comp: Div, 
  comp_params : { 
    className:`w-full items-center lg:items-start lg:w-[18rem] 
               flex flex-col gap-5`
  },
  fields: [
    {
      key: 'enabled', name: 'Enable', validate: true, 
      desc : 'Enable or disable the discount', 
      editable: true, defaultValue: true,
      comp: withCard(Switch, { className : 'text-gray-600'}, true),
      comp_params: {className: 'w-full'} 
    },
    {
      key: 'application', name: 'Automatic or Coupon', 
      validate: true, desc : desc_type, editable: true, 
      defaultValue: DiscountApplicationEnum.Manual,
      comp: withCard(
        withBling(create_select_view(Object.values(DiscountApplicationEnum))), 
        { className : 'text-gray-600'}, true
        ),
      comp_params: {className: 'w-full text-xs py-auto --font-semibold '} 
    },
    {
      key: 'order', name: 'Order of discount', type: 'number', 
      validate: true, desc : desc_order, editable: true, 
      comp: withCard(withBling(MInput), 
            { className: 'h-10', type: 'number', min : '0', step: '1'}, true), 
      comp_params: {className: 'w-full text-xs py-auto --font-semibold '} 
    },
    {
      key: 'tags', name: 'Tags', type: 'compund', validate: false, editable: true, 
      desc: 'Use Tags to quickly attach small attributes, that describe things',
      comp: withCard(TagsEdit),
      comp_params: {className: 'w-full  '} 
    },
    {
      key: 'attributes', name: 'Attributes', validate: false, editable: true, 
      desc: 'Attributes can contain richer text values than tags',
      comp: withCard(Attributes),  
      comp_params: {className: 'w-full'} 
    },
  ]
}

const root_schema = {
  name:'Root', comp: Div, comp_params : { 
    className:'w-full gap-5 --justify-center --bg-red-100 items-center \
              lg:max-w-max lg:items-start lg:w-fit flex flex-col \
              lg:flex-row --mx-auto'},
  fields: [
    left, right
  ]
}

const Actions = ({ onClickSave=undefined, onClickCreate=undefined, 
                   onClickDelete=undefined, onClickPublish=undefined,
                   onClickDuplicate=undefined, onClickReload,
                   id, className, isExported=false }) => {
  return (
  <RegularDocumentActions 
        id={id} className={className}
        onClickCreate={onClickCreate} 
        onClickDelete={onClickDelete}
        onClickDuplicate={onClickDuplicate}
        onClickReload={onClickReload}
        onClickSave={onClickSave}>
      <PromisableLoadingBlingButton 
            Icon={<BiAddToQueue/>} text={`${isExported ? 'update' : 'create'} collection` }
            show={Boolean(onClickPublish)}
            onClick={onClickPublish} className='' />
  </RegularDocumentActions>  
  )
}

/**
 * @typedef {object} State
 * @property {DiscountData} data
 * @property {boolean} hasChanged
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
  const [ externalErrors, setExternalErrors] = useState(undefined)

  const { 
    nav, navWithState, state 
  } = useNavigateWithState()

  // console.log('KKKKK ', doc);

  const ref_head = useRef()
  const hasChanged = state?.hasChanged ?? false
  const isEditMode = mode==='edit'
  const isCreateMode = mode==='create'
  const isViewMode = !(isEditMode || isCreateMode)
  // const nav = useNavigate()

  /**@type {DiscountData} */
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
          code: undefined,
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
      const [id, data] = await savePromise(false)
      // console.log('dd', dd);
      setExternalErrors(undefined)
      try {
        await getSDK().discounts.publish(data, 400, pako.gzip)
        await reload()
      } catch (e) {
        console.log('e', e);
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
  <DocumentTitle major={[collectionId, documentId ?? 'create']} 
                 className='' />  
  <DocumentDetails doc={doc} className='mt-5' 
                   collectionId={collectionId} />                     
  <Actions onClickSave={isEditMode ? savePromise : undefined}
           onClickCreate={isCreateMode ? createPromise : undefined}
           onClickPublish={!isCreateMode ? publishPromise : undefined}
           onClickDelete={!isCreateMode ? deletePromise : undefined} 
           onClickDuplicate={!isCreateMode ? duplicate : undefined}
           onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
           id={docId}
           isExported={doc?._published}
           className='mt-5'/>
  <CreateDate changes_made={hasChanged} ref={ref_head}  
              key={doc?.updatedAt}
              time={doc?.createdAt} className='mt-8' />            
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode} className='mt-8'>
    <div className='w-full max-w-[40rem] lg:w-fit lg:max-w-none mx-auto'>
      <EditMessage messages={error ?? externalErrors} className='w-full' />
      <FieldsView key={key} ref={ref_root} field={root_schema} 
                value={ doc ?? {} } 
                context={context}
                isViewMode={isViewMode} className='mt-8 mx-auto' />      
    </div>
  </ShowIf>
</div>
  )
}
