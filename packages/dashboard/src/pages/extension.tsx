import { useParams } from 'react-router-dom'
import FieldsView from '@/comps/fields-view'
import ShowIf from '@/comps/show-if'
import { withCard } from '@/comps/common-fields'
import ErrorMessage from '@/comps/error-message'
import JsonView from '@/comps/json'
import { Div, HR } from '@/comps/common-ui'
import { useDocumentActions } from '@/hooks/use-document-actions'
import MDView from '../comps/md-view'
import svg from '@/comps/favicon.svg';
import { BaseDocumentContext } from '.'

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
          key: 'description', name: 'Description', type: 'text', validate: false, 
          editable: true, 
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
      comp: withCard(JsonView, {}, true, true),
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

/**
 * Intrinsic state
 */
export type State = {
  data: undefined;
  hasChanged: boolean;
};
/**
 * Public context
 */
export type Context = BaseDocumentContext<State>;


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

 const {
   context, key, 
   doc, loading, hasLoaded, error,
   ref_root, 
 } = useDocumentActions(
   'extensions', documentId, '/apps/extensions'
 );

 const logo_url = doc?.info?.logo_url;

  return (
<div className='w-full lg:min-w-fit mx-auto'>
    
  <div className='flex flex-col --justify-between --h-full'>
    <span 
        children='Extension' 
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
