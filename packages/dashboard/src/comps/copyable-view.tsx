import { ClipBoardCopy } from "./common-fields.js";
import MDView from "./md-view.jsx"

/**
 * A view with `markdown` context, that is `copyable`
 */
export type CopyableViewParams = {
  /**
   * markdown text
   */
  value: string;
  /**
   * process the value
   * before copying
   */
  process_before_copy: (value: string) => string;
} & Omit<React.ComponentProps<'div'>, 'value'>;

/**
 * A view with `markdown` context, that is `copyable`
 */
export const CopyableView = (
  { 
    value, process_before_copy, ...rest
  }: CopyableViewParams
) => {

return (
  <div {...rest}>
    <div 
      className='flex flex-row items-center justify-between px-3 gap-3 w-full
                  shelf-input-color shelf-border-color border rounded-md'>
      <MDView
        className='rounded-md overflow-x-scroll
          text-base min-h-8 align-middle
            flex flex-row items-center' 
        value={value} />
      <ClipBoardCopy 
        value={value} 
        process_before_copy={process_before_copy} />
    </div>
  </div>
)
}