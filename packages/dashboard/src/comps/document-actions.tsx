import { useCallback, useRef, useState } from 'react'
import { AiOutlineDelete, 
         AiOutlineWarning } from 'react-icons/ai'
import { BiAddToQueue } from 'react-icons/bi'
import { HiOutlineDocumentDuplicate } from 'react-icons/hi'
import { TbReload } from 'react-icons/tb'
import { FiSave } from 'react-icons/fi'
import { LoadingButton, 
  PromisableLoadingBlingButton } from './common-button'
import { Bling } from './common-ui'
import Modal from './modal'
import ShowIf from './show-if'

export type RegularDocumentActionsParams = {
  onClickSave?: () => Promise<any>;
  onClickCreate?: () => Promise<any>;
  onClickDuplicate?: () => Promise<any>;
  onClickDelete?: (id: string) => Promise<any>;
  onClickReload?: () => Promise<any>;
  children?: React.ReactNode;
  id?: string;
} & React.ComponentProps<'div'>;


export const RegularDocumentActions = (
  { 
    onClickSave=undefined, onClickCreate=undefined, 
    onClickDelete=undefined, onClickDuplicate=undefined, 
    onClickReload=undefined, 
    id, children, ...rest 
  }: RegularDocumentActionsParams
) => {

  const ref_modal = useRef<import('./modal.jsx').ImpInterface>(undefined);  

  const [loadingDelete, setLoadingDelete] = useState(false)   

  const onClickDeleteInternal = useCallback(
    () => {
      ref_modal.current.setDataAndMessage(
        id, 
        `Are you sure you want to remove ${id} ?`
      )
      ref_modal.current.show()
    }, [id]
  );
  const onApproveDelete = useCallback(
    (data_id: string) => {
      // console.log('data_id', data_id)
      // return
      setLoadingDelete(true)
      onClickDelete(data_id).finally(
        () => setLoadingDelete(false)
      );
    }, [onClickDelete]
  );

return (
<div {...rest}>
  <div className='flex flex-row justify-between w-full'>
    <div className='flex flex-row flex-wrap items-center gap-2'>
      <PromisableLoadingBlingButton 
        Icon={<FiSave/>} text='save' 
        keep_text_on_load={true}
        show={Boolean(onClickSave)}
        onClick={onClickSave}/>
      <PromisableLoadingBlingButton 
        Icon={<BiAddToQueue/>} text='create' 
        keep_text_on_load={true}
        show={Boolean(onClickCreate)}
        onClick={onClickCreate} />
      <PromisableLoadingBlingButton 
        Icon={<HiOutlineDocumentDuplicate/>} text='duplicate' 
        show={Boolean(onClickDuplicate)}
        onClick={onClickDuplicate} />
      <PromisableLoadingBlingButton 
        Icon={<TbReload/>} text='reload' 
        show={Boolean(onClickReload)}
        keep_text_on_load={true}
        onClick={onClickReload} />
      {
        children
      }                  
    </div>
    <ShowIf show={Boolean(onClickDelete)}>

      <Bling stroke='border-2' className='h-fit' rounded='rounded-full'>
        <LoadingButton 
          className='h-6 px-2 
          bg-slate-50 dark:bg-slate-800 
          text-gray-600 dark:text-gray-400 
          rounded-full text-base font-semibold tracking-tight' 
          Icon={<AiOutlineDelete className='--text-red-500 text-base'/>}                        
          loading={loadingDelete} 
          text='delete' 
          keep_text_on_load={true}
          show={Boolean(onClickDelete)}
          onClick={onClickDeleteInternal}  />
      </Bling>     
    </ShowIf>
  </div>
  <Modal 
    ref={ref_modal} 
    onApprove={onApproveDelete} 
    title={
      <p className='text-xl flex 
                    flex-row items-center gap-3'>
        <AiOutlineWarning className='text-2xl'/> 
        Warning
      </p>
    }
  />  
</div>
  )
}
