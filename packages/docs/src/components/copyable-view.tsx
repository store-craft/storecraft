import { useCallback, useState } from "react";
import { RxCopy } from "react-icons/rx";

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
* A view with `markdown` context, that is `copyable`
*/
export type CopyableViewParams = {
  /**
   * markdown text
   */
  value: React.ReactNode;
  /**
   * markdown text
   */
  copyValue: string;
  /**
   * process the value
   * before copying
   */
  process_before_copy?: (value: string) => string;
} & Omit<React.ComponentProps<'div'>, 'value'>


export const write_clipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Content copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}


export const ClipBoardCopy = (
  { 
    value, config=1, process_before_copy=x=>x
  } : ClipBoardCopyButtonParams
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
    onClick={onClickCopy} 
  />
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
 */
export const CopyableView = (
  { 
    value, copyValue, process_before_copy, ...rest
  } : CopyableViewParams
) => {

return (
  <div {...rest}>
    <div 
      className='flex flex-row items-center 
        justify-between px-3 gap-3 w-full'>
      <div
        className=' overflow-x-scroll
          p-1 align-middle flex flex-row items-center' 
        children={value} />
      <ClipBoardCopy 
        value={copyValue ?? String(value)} 
        process_before_copy={process_before_copy} />
    </div>
  </div>
)
}