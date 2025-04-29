import { useCallback, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { Bling, InternalBlingParams } from './common-ui'

export type ButtonParams = {
  text?: string;
  icon?: React.ReactElement;
  className?: string;
  classNameSpan?: string;
  children?: any;
  rightView?: any;
} & React.ComponentProps<'button'>;

export type Button2Params = {
  text?: string;
  icon?: React.ReactElement;
  className?: string;
  classNameSpan?: string;
  children: any;
} & React.ComponentProps<'button'>;


export type LoadingButtonParams = {
  Icon?: React.ReactNode | JSX.Element;
  text?: string;
  keep_text_on_load?: boolean;
  className?: string;
  classNameLoading?: string;
  classNameLeft?: string;
  loading?: boolean;
  show?: boolean;
} & React.ComponentProps<'button'>;

/**
 * A loading button which expects a promise for onClick
 */
export type InternalPromisableLoadingButton = {
    onClick: () => Promise<any>;
    loading?: boolean;
};

export type PromisableLoadingButtonParams = {
  onClick: () => Promise<any>;
  loading?: boolean;    
} & Omit<LoadingButtonParams, "onClick">;

export type PromisableLoadingBlingButtonParams = {
  onClick: () => Promise<any>;
  show?: boolean;
  loading?: boolean;
  stroke?: string;
  rounded?: string;
  from?: string;
  to?: string;
} & Omit<LoadingButtonParams, "onClick">;

export type GradientFillIconParams = {
  from?: string;
  to?: string;
  Icon?: React.FC<{style?: any}>;
} & {
    [x: string]: any;
};

export type GradientStrokeIconParams = {
  from?: string;
  to?: string;
  Icon?: React.FC<{style?: any}>;
} & {
    [x: string]: any;
};

export const Button = (
  { 
    text, icon=undefined, className, classNameSpan, children, rightView, ...rest 
  }: ButtonParams
) => {

  return (
<button className={`flex flex-row items-center rounded-md cursor-pointer
                   py-2 justify-between ${className}`} {...rest} >
  <div className='flex flex-row items-center'>
    { icon }
    <div children={text} className={`px-3 ${classNameSpan}`}/>
  </div>                    
  {
    rightView ?? children
  } 
</button>
  )
}

export const Button2 = (
  { 
    text, icon=undefined, className, classNameSpan, children, ...rest 
  }: Button2Params
) => {

  return (
<button className={`flex flex-row items-center gap-1 rounded-md 
                    shelf-button-color-hard justify-center cursor-pointer
                   ${className}`} {...rest} >
  { icon }
  <span children={children ?? text} className={classNameSpan}/>
</button>
  )
}

const cls_default = `h-fit px-2 py-1 rounded-lg border 
                     w-fit flex flex-row items-center 
                    transition-colors duration-300`

export const LoadingButton = (
  { 
    Icon=null, show=true, text='', 
    keep_text_on_load=false, className=cls_default, 
    classNameLoading='inline text-sm',
    classNameLeft='w-4',
    loading, ...rest
  }: LoadingButtonParams
) => {

  if(!show)
    return null
  text = loading && !keep_text_on_load ? '' : text
  const cls_loading = 'animate-spin ' + classNameLoading
  const cls_span = 'whitespace-nowrap '
  // Icon = loading ? <AiOutlineLoading3Quarters className={cls_loading}/> : Icon
  // console.log('cls ', className);
  return (
<button className={`flex flex-row items-center gap-1 cursor-pointer ${className}`} {...rest} >
  <div className={'h-full flex flex-row items-center ' + classNameLeft}>
    {
      loading ? <AiOutlineLoading3Quarters className={cls_loading}/> :
      Icon
    }
  </div>
  {
    text &&
    <span children={text} className={cls_span}/>
  }
</button>
  )
}


export const PromisableLoadingButton = (
  { 
    onClick, loading: $loading, ...rest 
  }: PromisableLoadingButtonParams
) => {

  const [loading, setLoading] = useState($loading)
  const onClickWrapper = useCallback(
    () => {
      const stop_loading = () => setLoading(false)
      setLoading(true)
      onClick().then(stop_loading).catch(stop_loading)
      // onClick().finally(stop_loading)
    }, [onClick]
  )

  return (
    <LoadingButton 
        {...rest} 
        loading={loading} 
        onClick={onClickWrapper} />
  )
}


export const PromisableLoadingBlingButton = (
  {
    onClick, show=true, className='h-6', loading: $loading, 
    stroke='border', rounded='rounded-full', 
    from='from-pink-300 dark:from-pink-500',
    to='to-kf-300 dark:to-kf-500',
    ...rest
  }: PromisableLoadingBlingButtonParams
) => {

  const [loading, setLoading] = useState($loading)
  const onClickWrapper = useCallback(
    () => {
      const stop_loading = () => setLoading(false);

      setLoading(true);

      onClick().catch(()=>{}).finally(stop_loading);
    }, [onClick]
  );

  if(!show) return null;

  return (   
<Bling 
    stroke={stroke}
    className={className} 
    rounded={rounded}
    from={from}
    to={to} >
  <LoadingButton 
      className={`${rounded} px-2 h-full bg-slate-50 dark:bg-slate-800 
                text-gray-600 dark:text-gray-400 
                text-base font-semibold tracking-tight`} 
      loading={loading} 
      onClick={onClickWrapper} 
      {...rest}  />
</Bling> 
  )
}

export type BlingButtonParams = InternalBlingParams & {
  btnClassName?: string;
  text?: string;
} & React.ComponentProps<'button'>;

export const BlingButton = (
  { 
    from, to, rounded='rounded-lg', stroke='border-2', 
    children, text='what', className='h-10', 
    btnClassName='', ...rest 
  }: BlingButtonParams
) => {

  return (
<Bling 
    from={from} to={to} 
    rounded={rounded} 
    stroke={stroke} 
    className={className} >
  <button 
      className={`h-full w-full align-middle text-center px-3 
                  rounded-md shelf-button-color-soft cursor-pointer
                  whitespace-nowrap ${btnClassName}`} 
      children={children ?? text} {...rest}/>
</Bling>            
  )
}

export type BlingButton2Params = InternalBlingParams & Button2Params;

export const BlingButton2 = (
  { 
    from, to, rounded='rounded-lg', stroke, ...rest 
  }: BlingButton2Params
) => {

  return (
<Bling 
    from={from} to={to} 
    rounded={rounded} stroke={stroke} 
    className='w-fit h-fit'>
  <Button2 {...rest}/>
</Bling>            
  )
}


export const GradientFillIcon = (
  { 
    Icon, from='#973cff', to='rgb(236 72 153)', ...rest 
  }: GradientFillIconParams
) => {
  
  const id = btoa(`gradient_${from}_${to}`)
  
  return (
<>
  <svg width="0" height="0" className='absolute'>
    <linearGradient id={id} x1="100%" y1="100%" 
                    x2="0%" y2="0%" >
      <stop stopColor={from} offset="0%" />
      <stop stopColor={to} offset="100%" />
    </linearGradient>
  </svg>
  <Icon style={{ fill: `url(#${id})` }} {...rest} />
</>
  )
}

export const GradientStrokeIcon = (
  { 
    Icon, from='#973cff', to='rgb(236 72 153)', ...rest 
  }: GradientStrokeIconParams
) => {
  
  const id = btoa(`gradient_${from}_${to}`)
  
  return (
<>
  <svg width="0" height="0" className='absolute'>
    <linearGradient id={id} x1="100%" y1="100%" 
                    x2="0%" y2="0%" >
      <stop stopColor={from} offset="0%" />
      <stop stopColor={to} offset="100%" />
    </linearGradient>
  </svg>
  <Icon style={{ stroke: `url(#${id})` }} {...rest} />
</>
  )
}
