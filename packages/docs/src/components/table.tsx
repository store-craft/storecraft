import React from 'react'

export type TableProps = {
  rows: string[][]
} & React.ComponentProps<'div'>;

const Table = (
  { 
    rows, className='w-full', ...rest 
  } : TableProps
) => {

  const size = rows?.at(0)?.length ?? 0;

return (

<div className={className} {...rest}>
  <div className='w-full overflow-x-auto'>
    <table className='w-full rounded-t-xl --overflow-clip'>
      <thead className='text-left text-xs bg-slate-100 dark:bg-slate-100/10 h-10 '>
        <tr>
          {
            rows?.at(0)?.map(
              (c, ix) => (
                <th 
                  key={ix} 
                  children={c} 
                  className={'px-2 font-light ' + (ix==0 ? 'text-left' : (ix==size-1 ? 'text-right' : 'text-center'))}
                />
              )
            )
          }
        </tr>  
      </thead>

      <tbody className='font-light text-xs font-mono' >
      {
        rows.slice(1).map(
          (it, ix) => (
          <tr className='border-y border-kf-300/50 h-10  --text-pink-600 ' key={ix}>
            {
              it?.map(
                (d, ix) => (
                  <td 
                    children={d} key={ix}
                    className={
                      'px-1 tracking-widest --font-semibold text-sm ' + 
                      (
                        ix==0 ? 'text-left' : 
                        (ix==size-1 ? 'text-right' : 'text-center')
                      )
                    } 
                  />
                )
              )
            }
            {/* <td children={it[0]} 
                className='pl-1 tracking-widest font-semibold text-kf-500 dark:text-kf-400' />
            <td children={it[1]} 
                className='pl-5 tracking-widest font-semibold 
                        text-pink-500 dark:text-pink-400
                          max-w-xs overflow-y-auto' />
            <td children={it[2]} 
                className='px-3 text-right' /> */}
          </tr>  
          )
        )
      }
      </tbody>

    </table>
  </div>  
</div>  
  )
}

export default Table