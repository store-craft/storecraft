import { useParams } from 'react-router-dom'
import FieldsView from '@/comps/fields-view.jsx'
import ShowIf from '@/comps/show-if.jsx'
import { withCard } from '@/comps/common-fields.jsx'
import ErrorMessage from '@/comps/error-message.jsx'
import JsonView from '@/comps/json.jsx'
import { Div, HR } from '@/comps/common-ui.jsx'
import { useDocumentActions } from '@/hooks/use-document-actions.js'
import MDView from '../comps/md-view.jsx'
// @ts-ignore
import svg from '@/comps/favicon.svg';

const root_left_schema = {
  name:'Root', comp: Div, 
  comp_params : { className:'w-full lg:w-[35rem] flex flex-col gap-5'},
  fields: [
    {
      key: 'handle', name: 'Handle', type: 'text', validate: false, 
      editable: true, 
      comp: withCard(MDView, {}, true, true),  comp_params: { className: 'w-full' },
    },
    { 
      key: 'info', comp: Div, 
      comp_params: { 
        className : 'flex flex-col gap-5 w-full' 
      },
      fields: [
        {
          key: 'name', name: 'Name', type: 'text', validate: false, 
          editable: true, 
          comp: withCard(MDView), comp_params: { className: 'w-full' },
        },
        {
          key: 'description', name: 'Description', 
          comp: withCard(MDView),  comp_params: { className: 'w-full' },
        },
        {
          key: 'url', name: 'URL', type: 'text', validate: false, 
          editable: true, 
          comp: withCard(MDView),  comp_params: { className: 'w-full' },
        }
      ]
    },
  ]
}

const root_right_schema = {
  name:'Root2', comp: Div, 
  comp_params : { className:'w-full lg:w-[19rem] flex flex-col gap-5'},
  fields: [
    {
      key: 'config', name: 'Config',
      desc: 'RAW Config JSON data',
      comp: withCard(JsonView, { name: 'tomer'}, true, true),
      comp_params: { className: 'w-full' }
    },

  ]
}

const root_schema = {
  name:'Root', comp: Div, 
  comp_params : { 
    className: 'w-full items-center \
                lg:max-w-max lg:items-start lg:w-fit flex flex-col \
                lg:flex-row gap-5 mx-auto'
  },
  fields: [
    root_left_schema, root_right_schema
  ]
}

const root_schema2 = {
  name:'Root', comp: Div, 
  comp_params: { 
    className : 'flex flex-col gap-5 w-full max-w-[35rem]' 
  },
  fields: [

    {
      key: 'config', name: 'Config',
      desc: 'RAW Config JSON data',
      comp: withCard(JsonView, { name: 'tomer'}, true, true),
      comp_params: { className: 'w-full' }
    },
  ]
}

/**
 * 
 * @typedef {object} State Intrinsic state of `tag`
 * @property {import('@storecraft/core/api').TagType} data
 * @property {boolean} hasChanged
 * 
 *
 * @typedef { import('./index.jsx').BaseDocumentContext<State>
 * } Context Public `tag` context
 * 
 */

const Logo = ({className, ...rest}) => {

  return (
    <img 
      className={'rounded-md object-cover border dark:opacity-80 ' + className} 
      {...rest} />

  )

}


export default (
 { 
 }
) => {
                   
 const { id : documentId } = useParams();

 /** 
  * @type {import('@/hooks/use-document-actions.js').HookReturnType<
  *  import('./payment-gateways.jsx').PaymentGatewayItemGet>
  * } 
  */
 const {
   context, key, 
   doc, loading, hasLoaded, error,
   ref_root, 
 } = useDocumentActions(
   'payments/gateways', documentId, '/pages/payment-gateways'
 );

 const logo_url = doc?.info?.logo_url;

  return (
<div className='w-full lg:min-w-fit mx-auto'>
    
  <div className='flex flex-col --justify-between --h-full'>
    <span 
        children='Payment Gateway' 
        className='text-3xl text-black dark:text-gray-300' />
    <div className='flex flex-row items-center gap-2 h-20'>
      <Logo src={logo_url ?? svg} className='w-8 h-8' />
      <span 
          children={doc?.info?.name} 
          className='text-3xl text-gray-500 tracking-wide' />
    </div>
  </div>

  <HR className='mt-5' />

  <ShowIf show={hasLoaded} >
    <ErrorMessage 
        error={error} 
        className='w-full max-w-[35rem] mx-auto' />
    <FieldsView 
        key={key} ref={ref_root} field={root_schema} 
        value={ doc ?? {} } context={context}
        isViewMode={false} className='mx-auto' />      
  </ShowIf>
</div>
  )
}
