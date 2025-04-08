import { useCallback, useRef, useState } from 'react'
import { AiOutlineDelete, AiOutlineLink, 
  AiOutlineTags, AiOutlineWarning } from 'react-icons/ai/index.js'
import { SlActionRedo } from 'react-icons/sl/index.js'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDocument } from '@storecraft/sdk-react-hooks'
import { Bling, Card } from '@/comps/common-ui.jsx'
import DocumentTitle from '@/comps/document-title.jsx'
import ShowIf from '@/comps/show-if.jsx'
import Header from './image-header.js'
import Img from '@/comps/img.jsx'
import Modal from '@/comps/modal.jsx'
import { LoadingButton } from '@/comps/common-button.jsx'

export type LabelCapsuleParams = {
  value: string;
  label?: string | ((value: string) => string);
  bgColor?: string | ((value: string) => string);
} & React.ComponentProps<'div'>;

const LabelCapsule = (
  { 
    value, className='', label=value,
    bgColor='bg-pink-500', ...rest 
  }: LabelCapsuleParams
) => {

  const bg_color = (typeof bgColor === 'function') ? 
                    bgColor(value) : bgColor;
  const lbl = (typeof label === 'function') ? label(value) : 
              (typeof label==='string' ? label :
              (typeof value==='string' ? value : 'missing')) ;

  return (
<div className={`font-medium cursor-pointer text-white w-fit 
               p-1 px-3 rounded-full whitespace-nowrap --my-1
               hover:scale-105 transition-transform inline-block
               max-w-full overflow-x-auto
               ${className} ${bg_color}`} 
     children={lbl} {...rest} />
  )
}

export type TagsParams = {
  search: string[];
} & React.ComponentProps<'div'>;

const Tags = (
  { 
    search=[], className, ...rest 
  }: TagsParams
) => {

  return (
<div className={`flex flex-row flex-wrap gap-2 ${className} `} {...rest}>
  {
  search.map((it, ix) => (
    <LabelCapsule value={it} key={ix} />
  ))
  }
</div>    
  )
}

export type UsageParams = {
  usage: string[];
} & React.ComponentProps<'div'>;

const Usage = ({ usage=[], ...rest }: UsageParams) => {

  if(usage.length==0)
    return (
      <p children='No usage recorded' />
    )

  return (
<div>
  {
  usage.map((it, ix) => (
    <Link to={`/pages/${it}`} draggable='false' key={ix}>
      <p children={it} className='shelf-text-label-color underline font-semibold' />
    </Link>
  ))
  }
</div>    
  )
}

/**
 * 
 */
const ImagePage = ({}) => {

  const { handle } = useParams();

  const { 
    doc, loading, hasLoaded, error, op,
    actions: { 
      remove 
    }
  } = useDocument('images', handle);

  const ref_modal = useRef<import('@/comps/modal.jsx').ImpInterface>(undefined); 
  const [loadingDelete, setLoadingDelete] = useState(false);
  const nav = useNavigate();

  const onClickDeleteInternal = useCallback(
    () => {
      ref_modal.current.setDataAndMessage(
        handle, 
        `Are you sure you want to remove ${handle} ?`
      )
      ref_modal.current.show()
    }, [handle]
  );
  
  const onApproveDelete = useCallback(
    async (data_id) => {
      setLoadingDelete(true)
      try {
        await remove();
        nav(-2);
      } catch(e) {
        console.log(e)
      } finally {
        setLoadingDelete(false)
      }
    }, [remove, nav]
  );
  
  return (
<div className='w-full h-full'>
  <DocumentTitle major={['images', handle]} className='' />  
  <ShowIf show={hasLoaded} >
    <Card className='mt-10' error={error}>
      <div className='flex flex-col gap-10'>
        <div className='self-end'>
          <Bling stroke='border-2' className='w-fit h-fit' rounded='rounded-full'>
            <LoadingButton 
                className='h-6 px-2 
                bg-slate-50 dark:bg-slate-800 
                text-gray-600 dark:text-gray-400 
                rounded-full text-base font-semibold tracking-tight' 
                Icon={<AiOutlineDelete className='--text-red-500 text-base'/>}                        
                loading={loadingDelete} 
                text='delete'
                onClick={onClickDeleteInternal}  />
          </Bling>     

        </div>

        <ShowIf show={doc && hasLoaded}>
          <Img src={doc?.url} draggable='false'
              crossOrigin='anonymous'
              className='w-fit mx-auto h-full rounded-lg' />

          <div className='w-full'>
            <Header label='Url' Icon={AiOutlineLink} className='' />
            <a href={doc?.url} target='_blank' >
              <div children={doc?.url} 
                  className='break-words w-full underline' />
            </a>
          </div>    

          <div className='w-full'>
            <Header label='Usage' Icon={SlActionRedo} className='' />

            <Usage usage={doc?.usage} />
          </div>    

          <div className='w-full'>
            <Header label='Tags' Icon={AiOutlineTags} className='' />

            <Tags search={doc?.search} />
          </div>    
        </ShowIf>

      </div>
    </Card>
  </ShowIf>
  <Modal 
      ref={ref_modal} 
      onApprove={onApproveDelete} 
      title={
        <p className='text-xl flex 
                      flex-row items-center gap-3'>
          <AiOutlineWarning className='text-2xl'/> 
          Warning
        </p>
      }/>  

</div>    
  )
}

export default ImagePage