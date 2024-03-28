import { useCallback, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { Bling } from './common-ui'

export const Button = 
    ({ text, icon=undefined, className, classNameSpan, children, rightView, ...rest }) => {

  return (
<button className={`flex flex-row items-center rounded-md 
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

export const Button2 = 
  ({ text, icon=undefined, className, classNameSpan, children, ...rest }) => {

  return (
<button className={`flex flex-row items-center gap-1 rounded-md 
                    shelf-button-color-hard justify-center
                   ${className}`} {...rest} >
  { icon }
  <span children={children ?? text} className={classNameSpan}/>
</button>
  )
}

const cls_default = `h-fit px-2 py-1 rounded-lg border 
                     w-fit flex flex-row items-center 
                    transition-colors duration-300`

export const LoadingButton = 
  ({ Icon=null, show=true, text='', 
     keep_text_on_load=false, className=cls_default, 
     classNameLoading='inline text-sm',
     loading, ...rest}) => {

  if(!show)
    return null
  text = loading && !keep_text_on_load ? '' : text
  const cls_loading = 'animate-spin ' + classNameLoading
  const cls_span = 'whitespace-nowrap '
  Icon = loading ? <AiOutlineLoading3Quarters className={cls_loading}/> : Icon
  // console.log('cls ', className);
  return (
<button className={`flex flex-row items-center gap-1 ${className}`} {...rest} >
  { 
    Icon 
    // && 
    // <Icon className={`${classNameLoading} ${cls_loading} `}/>
  }
  {
    text &&
    <span children={text} className={cls_span}/>
  }
</button>
  )
}

/**
 * A loading button which expects a promise for onClick
 */
export const PromisableLoadingButton = 
  ({ onClick, loading: $loading, ...rest }) => {

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
    <LoadingButton {...rest} loading={loading} 
            onClick={onClickWrapper} />
  )
}

export const PromisableLoadingBlingButton = 
  ({onClick, show=true, className, loading: $loading, ...rest}) => {

  const [loading, setLoading] = useState($loading)
  const onClickWrapper = useCallback(() => {
    const stop_loading = () => setLoading(false)
    setLoading(true)
    onClick().catch(()=>{}).finally(stop_loading)
  }, [onClick])

  if(!show)
    return null

  return (   
<Bling stroke='p-px' className={className} rounded='rounded-full'
        from='from-pink-300 dark:from-pink-500' to='to-kf-300 dark:to-kf-500'>
  <LoadingButton 
          className='h-6 px-2 
                    bg-slate-50 dark:bg-slate-800 
                    text-gray-600 dark:text-gray-400 
                    rounded-full text-base font-semibold tracking-tight' 
          loading={loading} 
          onClick={onClickWrapper} {...rest}  />
</Bling> 
  )
}

export const BlingButton = 
  ({ from, to, rounded='rounded-lg', stroke='p-0.5', 
     children, text='what', className='h-10', 
     btnClassName='', ...rest }) => {
  return (
<Bling from={from} to={to} rounded={rounded} stroke={stroke} 
       className={className} >
  <button className={`h-full w-full align-middle text-center px-3 
                     rounded-md 
                     shelf-button-color-soft
                     whitespace-nowrap ${btnClassName}`} 
          children={children ?? text} {...rest}/>
</Bling>            
  )
}

export const BlingButton2 = 
  ({ from, to, rounded='rounded-lg', stroke, 
      ...rest }) => {
  return (
<Bling from={from} to={to} rounded={rounded} stroke={stroke} 
        className='w-fit h-fit'
        >
  <Button2 {...rest}/>
</Bling>            
  )
}

export const GradientFillIcon = 
  ({ Icon, from='#973cff', to='rgb(236 72 153)', ...rest }) => {
  
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

export const GradientStrokeIcon = 
  ({ Icon, from='#973cff', to='rgb(236 72 153)', ...rest }) => {
  
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
