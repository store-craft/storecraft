import { useCallback, useRef, useState } from 'react'
import { AiOutlineDelete, 
         AiOutlineWarning } from 'react-icons/ai/index.js'
import { BiAddToQueue } from 'react-icons/bi/index.js'
import { HiOutlineDocumentDuplicate } from 'react-icons/hi/index.js'
import { TbReload } from 'react-icons/tb/index.js'
import { FiSave } from 'react-icons/fi/index.js'
import { LoadingButton, 
  PromisableLoadingBlingButton } from './common-button.jsx'
import { Bling } from './common-ui.jsx'
import Modal from './modal.jsx'
import ShowIf from './show-if.jsx'

/**
 * @typedef {object} InternalRegularDocumentActionsParams
 * @property {() => Promise<void>} [onClickSave]
 * @property {() => Promise<void>} [onClickCreate]
 * @property {() => Promise<void>} [onClickDuplicate]
 * @property {(id: string) => Promise<void>} [onClickDelete]
 * @property {() => Promise<void>} [onClickReload]
 * @property {import('react').ReactNode} [children]
 * @property {string} [id]
 * 
 * @typedef {InternalRegularDocumentActionsParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } RegularDocumentActionsParams
 * 
 * @param {RegularDocumentActionsParams} param
 * 
 * @returns 
 */
export const RegularDocumentActions = (
  { 
    onClickSave=undefined, onClickCreate=undefined, 
    onClickDelete=undefined, onClickDuplicate=undefined, 
    onClickReload=undefined, 
    id, children, ...rest 
  }
) => {

  /** @type {import('react').MutableRefObject<import('./modal.jsx').ImpInterface>} */
  const ref_modal = useRef();  

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
    /**
     * @param {string} data_id 
     */
    (data_id) => {
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
          show={Boolean(onClickSave)}
          onClick={onClickSave}/>
      <PromisableLoadingBlingButton 
          Icon={<BiAddToQueue/>} text='create' 
          show={Boolean(onClickCreate)}
          onClick={onClickCreate} />
      <PromisableLoadingBlingButton 
          Icon={<HiOutlineDocumentDuplicate/>} text='duplicate' 
          show={Boolean(onClickDuplicate)}
          onClick={onClickDuplicate} />
      <PromisableLoadingBlingButton 
          Icon={<TbReload/>} text='reload' 
          show={Boolean(onClickReload)}
          onClick={onClickReload} />
      {
        children
      }                  
    </div>
    <ShowIf show={Boolean(onClickDelete)}>

      <Bling stroke='p-0.5' className='h-fit' rounded='rounded-full'>
        <LoadingButton 
            className='h-6 px-2 
            bg-slate-50 dark:bg-slate-800 
            text-gray-600 dark:text-gray-400 
            rounded-full text-base font-semibold tracking-tight' 
            Icon={<AiOutlineDelete className='--text-red-500 text-base'/>}                        
            loading={loadingDelete} 
            text='delete' show={Boolean(onClickDelete)}
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
      }/>  
</div>
  )
}
