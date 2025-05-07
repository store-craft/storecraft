import { useMemo, useRef } from 'react'
import { useCallback, useState } from 'react'
import { AiOutlineDelete, AiOutlineWarning } from 'react-icons/ai'
import { BiEditAlt, BiShow } from 'react-icons/bi'
import { LoadingButton } from './common-button'
import Modal from './modal'
import { RxCopy } from 'react-icons/rx'
import { read_clipboard, write_clipboard } from '../utils'
import { to_handle } from '@storecraft/sdk/src/utils.functional'
import { Bling, Card, Input, InputParams } from './common-ui'
import { LinkWithState } from '@/hooks/use-navigate-with-state'
import { Link } from 'react-router-dom'
import { MainPortal } from '@/layout'
import { FieldLeafViewParams } from './fields-view'
import { TableSchemaViewComponentParams } from './table-schema-view'
import { LuExternalLink } from 'react-icons/lu'
import { FiExternalLink } from 'react-icons/fi'
import { HiOutlineExternalLink } from 'react-icons/hi'

export type TextAreaParams = FieldLeafViewParams<string>
export type TimeStampViewParams = TableSchemaViewComponentParams<string>;
export type RecordActionsParams<T> = TableSchemaViewComponentParams<any, T>;
/**
 * This is used in `TableSchemaView`
 */
export type InternalSpanParams = {
  className?: string;
  extra?: string;
  children?: React.ReactNode;
};
export type SpanParams<T> = TableSchemaViewComponentParams<string, T> & 
  InternalSpanParams & 
  React.ComponentProps<'p'>;

/**
 * This is used in `TableSchemaView`
 */
export type InternalSpanArrayParams = {
  className?: string;
  classNameDelimiter?: string;
  delimiter?: string;
  name_fn?: (value: any) => string;
};
/**
 * This is used in `TableSchemaView`
 */
export type SpanArrayParams = TableSchemaViewComponentParams<any[]> & 
  InternalSpanArrayParams & 
  React.ComponentProps<'p'>;

export type InternalMInputParams = FieldLeafViewParams<string>;
export type MInputParams = InternalMInputParams & InputParams;
export type InternalInputWithClipboardParams = FieldLeafViewParams<string>;
export type InputWithClipboardParams = InternalInputWithClipboardParams & 
  React.ComponentProps<'div'>;

export type InternalHandleParams = FieldLeafViewParams<string>;
export type HandleParams = InternalHandleParams & React.ComponentProps<'div'>;
export type InternalSwitchParams = FieldLeafViewParams<boolean>;
export type SwitchParams = InternalSwitchParams & React.ComponentProps<'div'>;

/**
 * A `copy` to clipboard button
 */
export type ClipBoardCopyButtonParams = {
  value: string;
  config?: 0 | 1;
  /**
   * process the value
   * before copying
   */
  process_before_copy?: (value: string) => string;
};

/**
 * @param options [{id, name}, ...]
 * @param defaultIndex do not use it (use defaultValue in fieldsview instead)
 */
export const create_select_view = (
  options: {id:string|number, name:string}[], 
  defaultIndex=0
) => {

  const Select = (
    {
      field, value, onChange
    }: FieldLeafViewParams<{ id: string }>
  ) => {
    const { key, name, comp_params } = field;
    const [selectedOption, setSelectedOption] = useState(
      value ?? options[defaultIndex]
    );

    const onSelect = useCallback(
      (e) => {
        const option = options.find(
          it => it.id==parseInt(e.target.value).toString()
        );

        setSelectedOption(option)
        onChange && onChange(option)
      }, [options]
    )

    const { className, ...restInnerParams } = comp_params;
    const cls = 'h-10 px-1 w-full shelf-input-color rounded-md text-sm \
                focus:outline-none ' + className;

    return (
  <select name="limit" onChange={onSelect} 
          value={selectedOption.id} 
          className={cls} {...restInnerParams}>
  {
    options.map((t, ix) => (
      <option key={ix} value={t.id} children={t.name}/>
    ))
  }
  </select>                    
    )
  }

  return Select
}


export const TextArea = (
  {
    field, value, onChange, ...rest
  }: TextAreaParams
) => {
  const { key, comp_params } = field
  return (
<textarea 
    value={value} 
    onChange={e=>onChange(e.target.value)} 
    {...comp_params}  />
  )
}

const readable_span_cls = 'pr-3 py-2 max-w-[18rem] \
overflow-clip hover:overflow-x-auto inline-block whitespace-nowrap';


export const Span = <T,>(
  {
    value, children, className, 
    extra='max-w-[8rem] md:max-w-[18rem]', ...rest
  }: SpanParams<T>
) => {
  
  const readable_span_cls = 'overflow-clip hover:overflow-x-auto inline-block whitespace-nowrap'
  const merged = `${readable_span_cls} ${className} ${extra}`
  return (
    <div className={merged} {...rest} >
      <div children={value ?? children} />
    </div>
  )
}

/**
 * This is used in `TableSchemaView`
 */
export const SpanArray = ( 
  { 
    field, value, className, name_fn = t => t,  
    classNameDelimiter='text-pink-600 font-bold text-lg', 
    delimiter=' / ', ...rest
  }: SpanArrayParams
) => {
        
  const VV = value?.map(
    (it, ix) => (
      <span key={ix}>
        <span children={name_fn(it)}  />
        { ix<value?.length-1 && 
          <span children={delimiter} 
                className={classNameDelimiter} />
        }
      </span>
    )
  );

  return (
    <p className={`${readable_span_cls} ${className}`} 
        children={VV} {...rest} />
  )
}

/**
 * This component is used in a `TableSchemaView` 
 */
export const TimeStampView = (
  {
    field, value, ...rest
  }: TimeStampViewParams
) => {
  const { key, name, comp_params } = field
  return (
    <p children={new Date(value).toLocaleDateString()} 
      {...comp_params} {...rest} />
  )
}


export const MInput = (
  {
    field, value, onChange, type='text', ...rest
  }: MInputParams
) => {

  const { key, name, comp_params } = field
  const merged = { ...comp_params, ...rest}
  const { className, setError, error, ...rest_rest } = merged

  const onChangeInternal = useCallback(
    (e) => {
      let val = e.currentTarget.value
      if(type==='number')
        val = parseFloat(val)
      // console.log(val, type)
      onChange(val)
    }, [onChange, type]
  )

  return (
    <Input 
      type={field.type} 
      onWheel={(e) => (e.target as HTMLInputElement).blur()}
      className={className} 
      value={value ?? ''} 
      onChange={onChangeInternal} {...rest_rest}/>    
  )
}


export const InputWithClipboard = (
  { 
    value, field, onChange, setError, ...rest
  }: InputWithClipboardParams
) => {

  const onClick = useCallback(
    async () => {
      const clipboard = await read_clipboard()
      console.log(clipboard)
      if(clipboard)
        onChange(clipboard)
    }, [onChange, read_clipboard]
  )

  return (
<div {...rest}>
  <div className='w-full flex flex-row justify-end'>
    <p children='From Clipboard' 
      className='w-fit underline cursor-pointer 
        shelf-text-label-color
        dark:bg-kf-50/10 p-1 rounded-md
        text-sm font-medium tracking-wider' 
      onClick={onClick} />
  </div>
  <Bling className='w-full h-fit mt-2'>
    <MInput 
      field={field} value={value} 
      onChange={onChange} 
      className='w-full h-10' />
  </Bling>
</div>    
  )
}


export const Handle = (
  { 
    value, field, onChange, context, setError, ...rest
  }: HandleParams
) => {

  const onClick = useCallback(
    async () => {
      const title = context.query['title'].get()
      const handle = to_handle(value) ?? to_handle(title)
      onChange && onChange(handle)
    }, [onChange, context, value]
  )

  return (
<div {...rest}>
  <div className='w-full flex flex-row justify-end'>
    <p children='Auto Suggest' 
      className='w-fit underline cursor-pointer 
        shelf-text-label-color
      dark:bg-kf-50/10 p-1 rounded-md
        text-sm font-medium tracking-wider' 
      onClick={onClick} />
  </div>
  <Bling className='w-full h-fit mt-2'>
    <MInput 
      field={field} value={value} 
      onChange={onChange} 
      className='w-full h-10' />
  </Bling>
</div>    
  )
}

export const Switch = (
  {
    field, value=true, onChange, ...rest
  }: SwitchParams
) => {
  const { key, name, comp_params } = field
  const merged = { ...comp_params, ...rest}
  const { className } = comp_params

  const [toggle, setToggle] = useState(value)

  const onClickInternal = useCallback(
    () => {
      const new_toggle = !toggle
      setToggle(new_toggle)      
      onChange(new_toggle)
    }, [toggle, onChange]
  )

  let cls_container = `relative transition-all duration-300 --border
          rounded-3xl cursor-pointer w-16 h-8 flex flex-row`
  cls_container += (!toggle ? ' bg-red-400 ' : ' bg-teal-500 ')
  const cls_all = `absolute rounded-full w-1/2 h-full bg-white border shadow-md`
  const cls_anim = 'transition-all duration-300'
  const cls_toggle = toggle ? 'top-0 left-1/2' : 'top-0 left-0'
  const cls = cls_all + ' ' + cls_toggle + ' ' + cls_anim

  return (
<div className={cls_container} onClick={onClickInternal}>
  <div className={cls}  />
</div>    
  )
}


/**
 * A `copy` to clipboard button
 */
export const ClipBoardCopy = (
  { 
    value, config=1, process_before_copy=x=>x
  }: ClipBoardCopyButtonParams
) => {

  const [copied, setCopied] = useState(false)

  const onClickCopy = useCallback(
    () => {
      setCopied(true)
      write_clipboard(process_before_copy(value))
      setTimeout(
        () => setCopied(false),
        2000
      )
    }, [value, process_before_copy]
  );

  return (
<div className={`flex ${config==0 ? 'flex-row' : 'flex-row-reverse'} gap-1`}>
  <RxCopy 
    className='text-lg cursor-pointer text-gray-500 
    hover:text-gray-800 dark:hover:text-gray-400 inline' 
    onClick={onClickCopy} />
  { 
    copied && 
    <span 
      children='(copied)' 
      className='text-xs' />      
  }
</div>        
  )
}


export const withCard = <P extends FieldLeafViewParams<any>,>(
  Comp: React.FC<Partial<P>>, 
  comp_params_inner: Partial<P>={}, 
  border=true, 
  copy=false
) => {

  return (
    { 
      field, value, disabled, onChange, children=undefined, 
      error=undefined, setError, context, ...rest
    }:  FieldLeafViewParams<any> & {children?: React.ReactNode}
  ) => {

    const { key, desc, name, comp_params } = field;
    const { className, ...rest_comp_params } = comp_params || {};
    const new_field = { ...field, comp_params : comp_params_inner };

    const Copy = useMemo(
      () => copy ? (
        <ClipBoardCopy value={JSON.stringify(value)}/>
      ) : null,
      [copy, value]
    );

    return (
    <Card 
      id='card' 
      name={name} 
      error={error} 
      {...comp_params} 
      border={border} 
      desc={desc}
      rightView={Copy} 
      setError={setError}>
      <Comp 
        field={new_field} 
        value={value} 
        onChange={onChange} 
        disabled={disabled} 
        children={children} 
        error={error} 
        setError={setError} 
        context={context} 
        {...comp_params_inner} />
    </Card>
  )
  }
}


/**
 * This component is used in a `TableSchemaView` 
 */
export const RecordActions = <T,>(
  {
    context, field, value, ...rest
  }: RecordActionsParams<T>
) => {

  const ref_modal = useRef<import('./modal.jsx').ImpInterface>(undefined);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const id = context.item.handle ?? context.item.id;

  const onClickDelete = useCallback(
    () => {
      ref_modal.current.setDataAndMessage(
        id, 
        `Are you sure you want to remove ${id} ?`
      )
      ref_modal.current.show()
    }, [context]
  );

  const onApproveDelete = useCallback(
    (data_id: string) => {
      console.log('data_id', data_id);
      // return
      setLoadingDelete(true)
      context.deleteDocument(data_id)
             .finally(() => setLoadingDelete(false));
    }, [context]
  );

  return (
<div className='flex flex-row gap-3 items-center text-center flex-shrink-0
                 justify-end text-base overflow-clip w-fit mx-auto '>
  { 
    !context?.editDocumentUrl && context?.viewDocumentUrl &&
    <Link to={context.viewDocumentUrl(id)}>
      <BiShow className=' text-xl text-teal-600 --stroke-[0.5px] hover:stroke-[1px]' />
    </Link>
  }
  { 
    context?.linkExternalUrl &&
    <a href={context?.linkExternalUrl(id) ?? ''} target='_blank'>
      <HiOutlineExternalLink 
        className=' text-xl' />
    </a>
  }
  { 
  context?.editDocumentUrl && 
  <LinkWithState 
    to={context.editDocumentUrl(id)} 
    draggable='false' 
    current_state={() => context?.getState && context?.getState()}
    >
    <BiEditAlt 
      title='edit'
      className='text-2xl text-pink-500 cursor-pointer
        --stroke-0 hover:stroke-1' />
  </LinkWithState>
  }
  { 
    context?.deleteDocument && 
    <LoadingButton 
      title='delete'
      Icon={<AiOutlineDelete className='text-xl scale-125 text-kf-500 --outline-8'/>} 
      loading={loadingDelete} 
      className='px-0 py-0 border-0 cursor-pointer' 
      onClick={onClickDelete} />
  }
  <MainPortal.PortalChild>        
    <Modal 
      ref={ref_modal} 
      onApprove={onApproveDelete} 
      title={
        <p className='text-xl flex flex-row items-center gap-3 cursor-pointer'>
          <AiOutlineWarning className='text-2xl'/> Warning
        </p>
      }
    />
  </MainPortal.PortalChild>        
</div>
  )
}
