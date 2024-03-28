import { useEffect, useMemo, useState } from "react"
import { AiOutlineClose } from "react-icons/ai"
import { Bling } from "./common-ui"

const isEmpty = arr => Boolean(arr?.length) && Boolean(arr.filter(it => it!==undefined).length==0)

const EditMessage = ({ messages, positive=false, classname }) => {
  const [visible, setVisible] = useState(false)
  messages = useMemo(
    () => Array.isArray(messages) ? messages.map(it => it!==undefined ? String(it) : it) : [messages], 
    [messages]
  )

  useEffect(
    () => {
      const show = !isEmpty(messages)
      setVisible(show)
    }, [messages]
  )

  let cls_text = positive ? 'text-green-500' : 'text-red-700 dark:text-red-500'
  let cls = !visible ? 'max-h-0 mt-0 ' : 'max-h-[1000px] mt-0 '
  cls += ' my-8 w-full h-fit transition-max-height duration-500 \
          rounded-lg overflow-hidden ' + classname

  return (
<div className={cls}>
  <Bling stroke='p-[2px] dark:p-[1px] mt-5' rounded='rounded-lg' >
    <div className=' relative rounded-md dark:rounded-lg bg-gradient-to-br 
                   to-slate-50 dark:to-slate-800 
                   from-slate-50 dark:from-slate-800 
                   w-full'>
      <AiOutlineClose className='text-xl absolute right-2 top-2 
                      text-kf-500 
                        cursor-pointer hover:text-pink-500' 
                        onClick={() => setVisible(false)} />
      <ul className='list-disc w-full	list-inside p-5'>
        {
          messages.map((it, ix) => (
            <li children={it?.message ?? String(it)} key={ix} 
                className={'px-2 py-1 text-base font-semibold ' + cls_text} />
          ))
        }
      </ul>
    </div>    
  </Bling>    
</div>
  )
}

export default EditMessage