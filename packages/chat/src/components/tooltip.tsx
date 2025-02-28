import { ReactNode } from "react"

export const ToolTip = (
  {
    tooltip,
    children
  }: {
    children: ReactNode,
    tooltip: string
  }
) => {

  return (
    <div className='w-auto h-auto relative group inline-block '>
      {
        children
      }
      <span className='absolute left-0 top-0 -translate-y-[110%] opacity-100 
              text-sm tracking-wide z-50 bg-black p-2 whitespace-nowrap 
              rounded-md border text-white w-fit chat-border-color-soft
              invisible group-hover:visible'
          children={tooltip} />
    </div>
  )
}
