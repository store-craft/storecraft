import { useMemo, useRef } from 'react'
import { useCallback, useState } from 'react'
import { AiOutlineDelete, AiOutlineWarning } from 'react-icons/ai/index.js'
import { BiEditAlt, BiShow } from 'react-icons/bi/index.js'
import { LoadingButton } from './common-button.jsx'
import Modal from './modal.jsx'
import { RxCopy } from 'react-icons/rx/index.js'
import { read_clipboard, write_clipboard } from '../utils/index.js'
import { to_handle } from '@storecraft/sdk/src/utils.functional.js'
import { Bling, Card, Input } from './common-ui.jsx'
import { LinkWithState } from '../hooks/useNavigateWithState.js'
import { Link } from 'react-router-dom'


/**
 * This is used in `TableSchemaView`
 * 
 * @template {any} T
 * 
 * @typedef {object} InternalSpanParams
 * @prop {string} [className]
 * @prop {string} [extra]
 * @prop {(item: T) => string} url_fn create a `url`
 * @prop {() => any} get_state get current navigatio `state` 
 * @prop {React.ReactNode} [children]
 */ 

/** 
 * @template {any} [T=any] item `type`
 * 
 * @typedef {import('./table-schema-view.jsx').TableSchemaViewComponentParams<string, T> & 
 *   InternalSpanParams<T> & 
 *   React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
 * } SpanParams
 * 
 * @param {SpanParams} param
 */
export const SimpleLink = (
  {
    context, value, children, className, 
    extra='max-w-[8rem] md:max-w-[12rem]', 
    url_fn, get_state,
    ...rest
  }
) => {

  console.log('context', context)

  const readable_span_cls = 'overflow-x-auto inline-block whitespace-nowrap shelf-text-label-color'
  const merged = `${readable_span_cls} ${className} ${extra}`
  
  return (
    <div className={merged} {...rest} >
      <LinkWithState 
          current_state={get_state}
          children={value ?? children} 
          to={url_fn?.(context.item)} 
          className='underline'/>
    </div>
  )
}
