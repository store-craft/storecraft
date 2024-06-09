import { ClipBoardCopy } from "./common-fields.jsx";
import MDView from "./md-view.jsx"


/**
 * A view with `markdown` context, that is `copyable`
 * 
 * 
 * @typedef {object} CopyableViewParams
 * @prop {string} value markdown text
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
    value, process_before_copy, ...rest
  }
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