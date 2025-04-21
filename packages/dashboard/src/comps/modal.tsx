import { forwardRef, useCallback, 
  useImperativeHandle, useRef, useState } from 'react'
import { Card } from './common-ui'
import { Overlay } from './overlay'
import { BlingButton } from './common-button'

/**
 * Imperative interface
 */
export type ImpInterface = {
  show: Function;
  hide: Function;
  setDataAndMessage: (data: any, message: string, show?: boolean) => void;
};

export type ModalParams = {
  title?: React.ReactElement;
  onApprove: (key: string, value: any) => void;
} & Omit<React.ComponentProps<'div'>, "title">;


const QP = {}
const Modal = forwardRef(
  (
    { 
      title=(<p children='NA' className='text-gray-500' />), 
      onApprove, ...rest
    }: ModalParams, 
    ref: React.ForwardedRef<ImpInterface>
  ) => {

    const [dm, setDM] = useState({ data: undefined, message: 'NA'});

    const ref_overlay = useRef<import('./overlay.jsx').ImpInterface>(undefined);

    useImperativeHandle(
      ref,
      () => ({
        hide: () => ref_overlay.current.hide(),
        show: () => ref_overlay.current.show(),
        setDataAndMessage: (data, message, show) => {
          setDM({data, message})
          if (show)
            ref_overlay.current.show()
        }
      }),
      []
    );

    const onSelectInternal = useCallback(
      (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, v=undefined) => { 
        if(onApprove===undefined)
          return

        // steal the event from processing
        e.preventDefault();
        e.stopPropagation();

        ref_overlay.current.hide();
        onApprove(dm.data, v);
      }, [dm, onApprove]
    );
    
    return (
  <Overlay ref={ref_overlay} >
    <Card 
        name={title} 
        cardClass='shelf-card-light' 
        className='max-w-96 w-full' 
        onClick={e => e.stopPropagation()} >
      <p 
          children={dm.message} 
          className='text-red-500 text-lg break-words w-full whitespace-pre-wrap' />
      <div className='flex flex-row justify-between mt-10 text-base'>
        <BlingButton 
            stroke='border-b-2' 
            btnClassName='rounded-none'
            rounded='rounded-none'
            children='No' 
            onClick={() => ref_overlay.current.hide()} />
        <BlingButton stroke='border-b-2' 
            btnClassName='rounded-none'
            rounded='rounded-none'
            children='Yes' 
            onClick={e => onSelectInternal(e)} />
      </div>
    </Card>
  </Overlay>
    )
  }
)

export default Modal
