import { useCallback, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai/index.js'
import { Bling } from './common-ui.jsx'


/**
 * @typedef {object} InternalButtonparams
 * @property {string} [text]
 * @property {import('react').ReactElement} [icon]
 * @property {string} [className]
 * @property {string} [classNameSpan]
 * @property {any} children
 * @property {any} [rightView]
 * 
 * @typedef {InternalButtonparams & 
 * React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
 * } ButtonParams
 * 
 * @param {ButtonParams} param0 
 */
export const Button = (
  { 
    text, icon=undefined, className, classNameSpan, children, rightView, ...rest 
  }
) => {

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

/**
 * @typedef {object} InternalButton2params
 * @property {string} [text]
 * @property {import('react').ReactElement} [icon]
 * @property {string} [className]
 * @property {string} [classNameSpan]
 * @property {any} children
 * 
 * @typedef {InternalButton2params & 
 * React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
 * } Button2params
 * 
 * @param {Button2params} param0 
 * @returns 
 */
export const Button2 = (
  { 
    text, icon=undefined, className, classNameSpan, children, ...rest 
  }
) => {

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

/**
 * @typedef {object} InternalLoadingButtonParams
 * @property {import('react').ReactElement} [Icon]
 * @property {string} [text]
 * @property {boolean} [keep_text_on_load]
 * @property {string} [className]
 * @property {string} [classNameLoading]
 * @property {boolean} [loading]
 * @property {boolean} [show]
 * 
 * @typedef {InternalLoadingButtonParams & 
 * React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
 * } LoadingButtonParams
 * 
 * @param {LoadingButtonParams} param0 
 * @returns 
 */
export const LoadingButton = (
  { 
    Icon=null, show=true, text='', 
    keep_text_on_load=false, className=cls_default, 
    classNameLoading='inline text-sm',
    loading, ...rest
  }
) => {

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

/**
 * A loading button which expects a promise for onClick
 * 
 * @typedef {object} InternalPromisableLoadingButton
 * @prop {() => Promise<Void>} onClick
 * @prop {boolean} [loading]
 * 
 * @typedef {InternalPromisableLoadingButton & 
* Omit<LoadingButtonParams, 'onClick'>} PromisableLoadingButton
* 
* @param {PromisableLoadingBlingButton} param0 
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

/**
 * @typedef {object} InternalPromisableLoadingBlingButton
 * @prop {() => Promise<Void>} onClick
 * @prop {boolean} [show]
 * @prop {boolean} [loading]
 * 
 * @typedef {InternalPromisableLoadingBlingButton & 
 * Omit<LoadingButtonParams, 'onClick'>} PromisableLoadingBlingButton
 * 
 * @param {PromisableLoadingBlingButton} param0 
 */
export const PromisableLoadingBlingButton = (
  {
    onClick, show=true, className, loading: $loading, ...rest
  }
) => {

  const [loading, setLoading] = useState($loading)
  const onClickWrapper = useCallback(
    () => {
      const stop_loading = () => setLoading(false)
      setLoading(true)
      onClick().catch(()=>{}).finally(stop_loading)
    }, [onClick]
  );

  if(!show) return null

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

/**
 * 
 * @param {import('./common-ui.jsx').InternalBlingParams & 
 * { btnClassName?: string, text?: string } & 
 * React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
 * } param0 
 */
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

/**
 * 
 * @param {Button2params & import('./common-ui.jsx').InternalBlingParams} param0 
 */
export const BlingButton2 = (
  { 
    from, to, rounded='rounded-lg', stroke, ...rest 
  }
) => {

  return (
<Bling from={from} to={to} rounded={rounded} stroke={stroke} 
        className='w-fit h-fit'
        >
  <Button2 {...rest}/>
</Bling>            
  )
}


/**
 * 
 * @typedef {object} InternalGradientFillIconParams
 * @property {string} [from]
 * @property {string} [to]
 * @property {import('react').FC} [Icon]
 * 
 * @typedef {InternalGradientFillIconParams & {[x:string]:any}
* } GradientFillIconParams
* 
* @param {GradientFillIconParams} param0 
*/
export const GradientFillIcon = (
  { 
    Icon, from='#973cff', to='rgb(236 72 153)', ...rest 
  }
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

/**
 * 
 * @typedef {object} InternalGradientStrokeIconParams
 * @property {string} [from]
 * @property {string} [to]
 * @property {import('react').FC} [Icon]
 * 
 * @typedef {InternalGradientFillIconParams & {[x:string]:any}
* } GradientStrokeIconParams
* 
* @param {GradientStrokeIconParams} param0 
*/
export const GradientStrokeIcon = (
  { 
    Icon, from='#973cff', to='rgb(236 72 153)', ...rest 
  }
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
