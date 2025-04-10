import React, { forwardRef, useEffect, 
  useImperativeHandle, useState } from 'react'
import ShowIf from './show-if'
import { BiErrorCircle } from 'react-icons/bi'
import { IoClose } from 'react-icons/io5'
import { pubsub, EVENT_CHANGE, EVENT_REFRESH } from './fields-view'
import MDView from './md-view'
const SAVE_TEXT = "💡 changes made, don't forget to save"

/////

export type CreateDate2Params = {
  time: number;
  className: string;
} & React.ComponentProps<'div'>

export type HRParams = {
  dashed?: boolean;
} & React.ComponentProps<'input'>

export type TitleParams = {
} & React.ComponentProps<'input'>

export type LabelParams = {
} & React.ComponentProps<'div'>

export type DivParams = {
  setError: any;
} & React.ComponentProps<'div'>

export type InternalCreateDateParams = {
  time: string;
  changes_made?: boolean;
  /**
   * override
   */
  rightText?: string;
  className: string;
};

export type CreateDateParams = InternalCreateDateParams & 
  React.ComponentProps<'div'>;

export type CreateDateImperativeInterface = {
  get: () => boolean;
  set: (value?: boolean) => void;
};

export type InputInternalParams = {
  overrideClass?: boolean;
  className?: string;
};

export type InputParams = InputInternalParams & 
  React.ComponentProps<'input'>;


export type BlingInputInternalParams = {
  inputClsName?: string;
};

export type BlingInputParams = BlingInputInternalParams & InternalBlingParams & InputParams;
/**
 * Background container with gradient
 */
export type InternalBlingParams = {
  className?: string;
  rounded?: string;
  children?: any;
  stroke?: string;
  from?: string;
  to?: string;
};
/**
 * Background container with gradient
 */
export type BlingParams = InternalBlingParams & React.ComponentProps<'div'>;

export type InternalCardParams = {
  name?: React.ReactNode;
  setError?: (e: any) => void;
  error?: string;
  children: React.ReactNode;
  border?: boolean;
  desc?: string;
  rightView?: React.ReactElement;
  cardClass?: string;
  rest?: any[];
};

export type CardParams = InternalCardParams & React.ComponentProps<'div'>;

/////


export const CreateDate = forwardRef(
(
  { 
    time, changes_made=false, rightText='created at: ', ...rest 
  }: CreateDateParams, 
  ref
) => {

  const [changed, setChanged] = useState(changes_made)
  const text = time ? rightText + new Date(time).toLocaleString() : '*'

  useEffect(
    () => {
      return pubsub.add_sub(
        (e) => {
          // console.log('e', e)
          switch(e) {
            case EVENT_CHANGE:
              setChanged(true);
              return;
            case EVENT_REFRESH:
              // setChanged(false);
              return;
            default:
              return
          }
        }
      )
    }, [pubsub]
  )

  useImperativeHandle(
    ref,
    () => (
      {
        get: () => changed,
        set: (to=false) => setChanged(to)
      }
    ),
    [changed]
  )

  return (
<div {...rest}>
  <div className='relative w-full flex flex-row 
                  justify-between items-center'>
    {
      changed && 
      <p 
        children={SAVE_TEXT} 
        className='absolute left-0 -top-full shelf-border-color 
                  border rounded-md px-1 py-0
                  bg-lime-50/50 text-green-700 
                      dark:bg-white/10 dark:text-green-300
                      dark:border-none' />
   }
    <span className='flex-1 border-t shelf-border-color mr-3' />
    {
      <p 
        children={text} 
        className='text-gray-500 dark:text-gray-400 
                    text-sm italic flex-shrink-0' />
    }
  </div>
</div>  
  )
}
)

export const CreateDate2 = (
  { 
    time, className='', ...rest 
  }: CreateDate2Params
) => {
  const text = 'created at: ' + new Date(time).toLocaleString()
  return (
<div className={className} {...rest}>
  <fieldset className='border-t shelf-border-color text-right'>
    {
      time>0 &&
      <legend className='text-gray-500 dark:text-gray-400 
                          pl-3 text-sm italic' 
        children={text}/>
    }
  </fieldset>  
</div>  
  )
}

export const HR = ({ dashed=false, ...rest }: HRParams) => {
  const base = 'shelf-border-color'
  const cls = base + (dashed ? ' border-dashed' : '')
  return (
<div {...rest}>
  <hr className={cls}/>
</div>    
  )
}

export const Title = ({className, ...rest}: TitleParams) => {
  return (
<p {...rest}
   className={`${className} text-4xl shelf-text-title-color `} />

  )
}

export const Label = ({ ...rest }) => {

  return (
<div className='text-base shelf-text-label-color
                font-medium underline w-fit
                max-w-max overflow-x-auto inline'>
  <span {...rest} />
</div>
  )
}

const InputDefaultClass = `rounded-md pl-3 
                            w-full block text-base 
                            hover:ring-pink-400 hover:ring-2
                            shelf-input-color
                            focus:outline-none  
                            font-normal transition-none`

export const Input = forwardRef(
  (
    { 
      className='h-10 px-3', overrideClass=false, ...rest 
    }: InputParams, 
    ref: React.Ref<HTMLInputElement>
  ) => {

  const cls = overrideClass ? className : `${InputDefaultClass} ${className}`
    return (
  <input {...rest}
        ref={ref}
        // @ts-ignore
        onWheel={(e) => e.target.blur()}
        className={cls} 
        />    
    )
  }
)

export const BlingInput = forwardRef(
  (
    { 
      from, to, rounded='rounded-md', stroke, className,
      inputClsName='h-10 rounded-md px-3', ...rest 
    }: BlingInputParams, 
    ref: React.Ref<HTMLInputElement>
  ) => {

    return (
<Bling 
    from={from} to={to} 
    rounded={rounded} stroke={stroke} 
    className={className}>      
  <Input 
      ref={ref} 
      className={inputClsName} 
      {...rest} /> 
</Bling>           
    )
  }
)

/**
 * @param color_stops 
 */
export const border_bling_style = (color_stops=['#efefec', '#973cff']) => {

  return {
    style: {
      'background-image': `linear-gradient(white, white), linear-gradient(to right, ${color_stops.join(',')})`,
      'background-clip': 'padding-box, border-box',
      'border-color': 'transparent',
      'background-origin': 'padding-box, border-box',
      // 'background-color': 'light-dark(#ccc, #333)'
    }
  }
}


// 
/**
 * Background container with gradient
 */
export const Bling = ( 
  { 
    className, rounded='rounded-md', 
    children, stroke='border', 
    from='from-pink-500 dark:from-pink-600', 
    to='to-kf-500 dark:to-kf-500', ...rest 
  }: BlingParams
) => {

  return (
<div 
    className={`bg-gradient-to-r 
    ${from} ${to} ${stroke} 
    ${rounded} ${className}`} 
    {...rest}
    style={
      {
        // @ts-ignore
        'background-clip': 'border-box',
        'border-color': 'transparent',
        'background-origin': 'border-box'
      }
    }
    children={children}/>
  )

}


export const withBling = (Comp, params = {}) => {
  return ( { ...rest } ) => {
    return (
      <Bling {...params}>
        <Comp {...rest} />
      </Bling>
    )
  }
}

export const withBling2 = (Comp) => {
  return ( { ...rest } ) => {
    return (
<div className='bg-gradient-to-r from-pink-400 
              to-kf-300 p-[1px] rounded-lg'>
  <Comp {...rest} />      
</div>      
    )
  }
}


export const Div = ({setError, ...rest}: DivParams) => 
          (<div {...rest} />);

/**
 */  
export const Card = (
  { 
    name, setError, error=undefined, children, 
    border=true, desc=undefined, rightView, 
    cardClass='shelf-card', ...rest
  }: CardParams
) => {

  return (
<div {...rest}>
  <div 
      className={`w-full text-left 
                  ${border ? 'border rounded-lg shadow-sm dark:shadow-xl  p-5 ' + cardClass : ''}
                `}>

    {
      (name || rightView) && 
      (
        <>
          <div className='flex flex-row justify-between items-center'>
          { name && 
            <div children={name} className='text-base w-fit' />
          }
          { rightView }
          </div>                    
          <HR className='mt-3 --mb-5' /> 
        </> 
      )
    }
    <ShowIf show={desc}>
      <MDView 
          value={desc} 
          className='text-sm shelf-text-minor-light mt-3 
                    tracking-wider --whitespace-pre-line'/>
      <HR className='mt-3 --mb-5'  />
    </ShowIf>

    <div children={children} className='mt-5' />
    { 
      error && 
      <div 
        className='flex relative flex-row flex-nowrap items-center text-base 
                  text-red-700 dark:text-red-400
                  bg-red-400/25 border border-red-400 rounded-md p-3 mt-5 '>
        <BiErrorCircle className='flex-inline text-2xl flex-shrink-0 opacity-70' /> 
        <MDView value={error} className='mx-3 overflow-auto' />
        {/* <div children={error} className='mx-3' /> */}
        <IoClose 
            className='flex-inline absolute top-1 right-1 
                       cursor-pointer text-2xl flex-shrink-0 opacity-90' 
            onClick={() => setError && setError(undefined)}/>
      </div>
    }
  </div>
</div>
  )
}
