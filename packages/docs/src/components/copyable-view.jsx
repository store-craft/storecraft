import { useCallback, useState } from "react";
import { RxCopy } from "react-icons/rx";


/**
 * 
 * @param {string} text 
 */
export const write_clipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Content copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}


/**
 * A `copy` to clipboard button
 * 
 * @typedef {object} ClipBoardCopyButtonParams
 * @prop {string} value
 * @prop {0 | 1} [config=1]
 * @prop {(value: string) => string} [process_before_copy] process the value
 * before copying
 * 
 * 
 * @param {ClipBoardCopyButtonParams} params
 */
export const ClipBoardCopy = (
  { 
    value, config=1, process_before_copy=x=>x
  }
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
      className='text-lg cursor-pointer  inline' 
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


/**
 * A view with `markdown` context, that is `copyable`
 * 
 * 
 * @typedef {object} CopyableViewParams
 * @prop {import("react").ReactNode} value markdown text
 * @prop {string} copyValue markdown text
 * @prop {(value: string) => string} process_before_copy process the value
 * before copying
 * 
 * 
 * @param {CopyableViewParams & 
 *  Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'value'>
 * } params
 * 
 */
export const CopyableView = (
  { 
    value, copyValue, process_before_copy, ...rest
  }
) => {

return (
  <div {...rest}>
    <div 
        className='flex flex-row items-center justify-between px-3 gap-3 w-full'>
      <div
          className=' overflow-x-scroll
          p-1 align-middle
             flex flex-row items-center' 
          children={value} />
      <ClipBoardCopy 
          value={copyValue ?? String(value)} 
          process_before_copy={process_before_copy} />
    </div>
  </div>
)
}