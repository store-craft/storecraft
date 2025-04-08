import { AiFillCloseCircle } from 'react-icons/ai/index.js'

/**
 * @param {any} v 
 */
const default_name_fn = v => v

export type CapsulesViewParams<T = any> = {
  tags: T[];
  name_fn?: (x: T) => string;
  clsCapsule?: string;
  className?: string;
  onRemove?: (v: T) => void;
  onClick: (v: T) => void;
};

const CapsulesView = <T,>(
  { 
    tags=[], name_fn=default_name_fn, className, 
    clsCapsule='bg-kf-500', 
    onRemove=undefined, 
    onClick=undefined 
  }: CapsulesViewParams<T>
) => {

  if(!tags?.length)
    return null
  
  return (
<div className={`flex flex-row flex-wrap w-full text-sm 
              text-white gap-1 ${className}`}>
{ 
  tags.map(
    (it, ix) => (
    <div 
      key={ix}
      className={
        `flex flex-row items-center border shelf-border-color-blend
          rounded-2xl w-fit max-w-full px-0.5 py-0 --m-1 font-medium
          ${clsCapsule}`
      }
    >
      <button 
        children={name_fn(it)} 
        onClick={() => onClick(it)} 
        className='mx-1 max-w-full overflow-x-auto py-0
                    hover:scrollbar-thin scrollbar-none cursor-pointer
                    whitespace-nowrap --underline --decoration-double 
                    decoration-white/60 
                    --underline-offset-[1px] --border-b --border-dashed  ' />
      {onRemove && 
        <AiFillCloseCircle 
          className='text-lg cursor-pointer flex-shrink-0'
          onClick={(e) => { e.stopPropagation(); onRemove && onRemove(it)}}/>}
    </div>
    )
  )
}
</div>
  )
}

export default CapsulesView