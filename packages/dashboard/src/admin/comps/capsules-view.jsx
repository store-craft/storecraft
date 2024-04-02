import { AiFillCloseCircle } from 'react-icons/ai/index.js'

const default_name_fn = v => v

/**
 * @template T
 * @param {object} p
 * @param {T[]} p.tags
 * @param {(x: T) => string} [p.name_fn]
 * @param {string} p.clsCapsule
 * @param {string} p.className
 * @param {(v: T) => void} p.onRemove
 * @param {(v: T) => void} p.onClick
 */
const CapsulesView = 
  ({ tags=[], name_fn=default_name_fn, className, 
     clsCapsule='bg-kf-500', 
     onRemove=undefined, 
     onClick=undefined }) => {

  if(!tags?.length)
    return null
  
  return (
<div className={`flex flex-row flex-wrap w-full text-sm 
              text-white gap-1 ${className}`}>
{ 
  tags.map(
    (it, ix) => (
    <div key={ix}
         className={`flex flex-row items-center border-kf-200 
                     rounded-2xl w-fit max-w-full px-0.5 py-px --m-1 font-medium
                     ${clsCapsule}`}>
      <button children={name_fn(it)} 
              onClick={() => onClick(it)} 
              className='mx-1 max-w-full overflow-x-auto py-0
                         hover:scrollbar-thin scrollbar-none
                         whitespace-nowrap --underline --decoration-double 
                         decoration-white/60
                         --underline-offset-[1px] --border-b --border-dashed  ' />
      <AiFillCloseCircle 
          className='text-lg cursor-pointer flex-shrink-0'
          onClick={(e) => { e.stopPropagation(); onRemove && onRemove(it)}}/>
    </div>
    )
  )
}
</div>
  )
}

export default CapsulesView