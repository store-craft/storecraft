import { useEffect, useMemo, useState } from "react"
import { AiOutlineClose } from "react-icons/ai/index.js"
import { Bling } from "./common-ui.jsx"

/**
 * Easily `format` errors coming from the `storecraft` backend
 * 
 * @param {import("@storecraft/core/api").error} error 
 */
export const format_storecraft_errors = error => {
  return error?.messages?.map(
    it => {
      let msg = '';
      if(it.path) {
        msg += it.path.join('.') + ' - '
      }
      msg += it.message ?? 'Unknown Error';
      return msg;
    }
  ) ?? ['ouch, unexpected error'];
}

/**
 * error message view from document pages
 * 
 * @typedef {object} InternalEditMessage
 * @prop {import("@storecraft/core/api").error} [error]
 * @prop {boolean} [positive]
 * @prop {string} [className]
 * 
 * @typedef {InternalEditMessage & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } EditMessageParams
 * 
 * @param {EditMessageParams} param
 */
const ErrorMessage = (
  { 
    error, positive=false, className, ...rest 
  }
) => {
  console.log('error ', error)

  const [visible, setVisible] = useState(false)
  const messages = useMemo(
    () => format_storecraft_errors(error), 
    [error]
  );

  useEffect(
    () => {
      const show = Boolean(error && error.messages?.length);
      setVisible(show)
    }, 
    [error]
  );

  let cls_text = positive ? 'text-green-500' : 'text-red-700 dark:text-red-500'
  let cls = !visible ? 'max-h-0 mt-0 ' : 'max-h-[1000px] mt-0 '
  cls += ' my-8 w-full h-fit transition-max-height duration-500 \
          rounded-lg overflow-hidden ' + className

  return (
<div className={cls}>
  <Bling 
      stroke='border-2 dark:border mt-5' 
      rounded='rounded-lg' >
    <div 
        className=' relative rounded-md dark:rounded-lg bg-gradient-to-br 
                   to-slate-50 dark:to-slate-800 
                   from-slate-50 dark:from-slate-800 
                   w-full'>
      <AiOutlineClose 
          className='text-xl absolute right-2 top-2 
                   text-kf-500 cursor-pointer hover:text-pink-500' 
          onClick={() => setVisible(false)} />
      <ul className='list-disc w-full	list-inside p-5'>
        {
          messages?.map((it, ix) => (
            <li 
                children={it ?? String(it)} 
                key={ix} 
                className={'px-2 py-1 text-base font-semibold ' + cls_text} />
          ))
        }
      </ul>
    </div>    
  </Bling>    
</div>
  )
}

export default ErrorMessage