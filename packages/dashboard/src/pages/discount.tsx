import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import FieldsView from '@/comps/fields-view.jsx'
import { CreateDate, Div, withBling } from '@/comps/common-ui.jsx'
import { MInput, withCard, 
  create_select_view, Switch, Handle 
} from '@/comps/common-fields.jsx'
import ShowIf from '@/comps/show-if.jsx'
import DiscountFilters, { discount_filters_validator } 
       from '@/comps/discount-filters.jsx'
import DiscountDetails, { discount_details_validator } 
       from '@/comps/discount-details.jsx'
import DocumentTitle from '@/comps/document-title.jsx'
import ErrorMessage from '@/comps/error-message.jsx'
import Media from '@/comps/media.jsx'
import { PromisableLoadingBlingButton } from '@/comps/common-button.jsx'
import { BiAddToQueue } from 'react-icons/bi/index.js'
import DocumentDetails from '@/comps/document-details.jsx'
import TagsEdit from '@/comps/tags-edit.jsx'
import { RegularDocumentActions } from '@/comps/document-actions.jsx'
import Attributes from '@/comps/attributes.jsx'
import { JsonViewCard } from '@/comps/json.jsx'
import MDEditor from '@/comps/md-editor.jsx'
import { DiscountApplicationEnum } from '@storecraft/core/api/types.api.enums.js'
import { DocumentActionsMode, useDocumentActions } from '@/hooks/use-document-actions.js'
import DiscountPerformance from '../comps/discount-performance.jsx'
import { DiscountType } from '@storecraft/core/api'
import { BaseDocumentContext } from './index.jsx'

/**
 * @param {string} v 
 */
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
      key: 'filters', name: '🔎 Filters', validate: true, 
      validator : discount_filters_validator, 
      desc: 'Define which products or orders (by date, amount \
        or customers) are eligible for discount',
      comp: withCard(DiscountFilters, { className: 'w-full h-9'}, true),
      comp_params: {className: 'w-full'}
    },
    {
      key: 'details', name: '⚙️ Discount Details', validate: true, 
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
      key: 'handle', name: '🎟️ Discount Code', type: 'text', validate: true, 
      validator: validator_code, editable: true, 
      desc: 'A short word identifier for the discount' ,
      comp: withCard(Handle, { 
        className: 'w-full h-fit', type: 'text', placeholder: 'code ...'
      }), 
      comp_params: { className: 'w-full text-xs py-auto --font-semibold' } 
    },
    info,
    { 
      key: 'media', name: '🎥 Media', type: 'text', 
      desc: 'Manage and edit your media files' ,validate: false, 
      editable: true, 
      comp: withCard(Media),  comp_params: {className: 'w-full'} 
    },
    {
      key: 'description', name: '📝 Description', type: 'text', validate: false, 
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

const desc_order = `
Order determines the order in which automatic discounts are applied. 
<br/><br/> 
Discounts are arranged as a stack and the order of application is important.
<br/><br/> 
For Example, A discount with a \`0\` order will be applied before a discount with order 10.
<br/><br/> 
Free Shipping for orders above say 100$ should be applied last and therefore should 
have a high order number`

const desc_type = `
Decide whether the discount is:
- **Automatically** applied, or
- **Coupon** (applied by user)
`

const right = {
  name:'Main', comp: Div, 
  comp_params : { 
    className:`w-full items-center lg:items-start lg:w-[18rem] 
               flex flex-col gap-5`
  },
  fields: [
    {
      key: 'active', name: 'Enable', validate: true, 
      desc : 'Enable or disable the discount', 
      editable: true, defaultValue: true,
      comp: withCard(Switch, { className : 'text-gray-600'}, true),
      comp_params: {className: 'w-full'} 
    },
    {
      key: undefined, name: '🚀 Performance',
      desc : 'This is how this discount performs', 
      comp: withCard(DiscountPerformance, { className : ''}, true),
      comp_params: {className: 'w-full'}  
    },
    {
      key: 'application', name: 'Automatic or Coupon', 
      validate: true, desc : desc_type, editable: true, 
      defaultValue: DiscountApplicationEnum.Auto,
      comp: withCard(
        withBling(create_select_view(Object.values(DiscountApplicationEnum))), 
        { className : 'text-gray-600'}, true
        ),
      comp_params: {className: 'w-full text-xs py-auto --font-semibold '} 
    },
    {
      key: 'priority', name: 'Order of discount', type: 'number', 
      validate: true, desc : desc_order, editable: true, 
      comp: withCard(withBling(MInput), 
            { className: 'h-10', type: 'number', min : '0', step: '1'}, true), 
      comp_params: {className: 'w-full text-xs py-auto --font-semibold '} 
    },
    {
      key: 'tags', name: '# Tags', type: 'compund', validate: 
      false, editable: true, 
      desc: 'Use Tags to quickly attach small attributes, \
      that describe things',
      comp: withCard(TagsEdit),
      comp_params: {className: 'w-full  '} 
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
        Icon={<BiAddToQueue/>} 
        text={`${isExported ? 'update' : 'create'} collection` }
        show={Boolean(onClickPublish)}
        onClick={onClickPublish} className='' />
  </RegularDocumentActions>  
  )
}

/**
 * Intrinsic state
 */
export type State = {
  data: DiscountType;
  hasChanged: boolean;
};
/**
* Public context
*/
export type Context = BaseDocumentContext<State>;


export default (
 { 
   mode, ...rest
 }: {
  mode: DocumentActionsMode
 }
) => {
                   
  const { id : documentId, base } = useParams();

  const {
    actions: {
      savePromise, deletePromise, reload, setError,
      duplicate
    },
    context, key, sdk,
    doc, isCreateMode, isEditMode, isViewMode, 
    loading, hasChanged, hasLoaded, error,
    ref_head, ref_root, 
  } = useDocumentActions(
    'discounts', documentId, '/pages/discounts', mode, base
  );

  const publishPromise = useCallback(
    async () => {
      await savePromise()
      const data = await reload();
      setError(undefined)
      try {
        // await sdk.discounts.publish(data, 400, pako.gzip)
        await reload()
      } catch (e) {
        console.log('e', e);
        setError({ error: { messages: [ { message: e.toString() } ]}});
      }
    }, [savePromise, reload]
  )


  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle 
      major={['discounts', documentId ?? 'create']} 
      className='' />  
  <DocumentDetails 
      doc={doc} className='mt-5' 
      collectionId={'discounts'} />                     
  <Actions 
      onClickSave={isEditMode ? savePromise : undefined}
      onClickCreate={isCreateMode ? savePromise : undefined}
      onClickPublish={!isCreateMode ? publishPromise : undefined}
      onClickDelete={!isCreateMode ? deletePromise : undefined} 
      onClickDuplicate={!isCreateMode ? () => duplicate({ title: doc?.title + ' duplicate'}) : undefined}
      onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
      id={doc?.id}
      isExported={Boolean(doc?.published)}
      className='mt-5'/>
  <CreateDate 
      changes_made={hasChanged} ref={ref_head}  
      key={doc?.updated_at}
      time={doc?.created_at} 
      className='mt-8' />            
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode} >
    <div className='w-full max-w-[40rem] lg:w-fit lg:max-w-none mx-auto'>
      <ErrorMessage error={error} className='w-full' />
      <FieldsView 
        key={key} ref={ref_root} 
        field={root_schema} 
        value={ doc ?? {} } 
        context={context}
        isViewMode={isViewMode} 
        className='mt-8 mx-auto' />      
    </div>
  </ShowIf>
</div>
  )
}
