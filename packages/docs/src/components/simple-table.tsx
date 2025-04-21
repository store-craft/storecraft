import React from 'react';

export type SimpleTableParams = {
  column_names: string[];
  rows: string[][];
} & React.ComponentProps<'div'>

export const SimpleTable = (
  { 
    column_names, rows, className='w-full', ...rest 
  }: SimpleTableParams
) => {

const first = (ix=0) => ix==0;
const last = (ix=0) => ix==column_names.length-1;

return (

<div className={className} {...rest}>
  <div className='w-full overflow-x-auto '>
    <table className='w-full overflow-clip rounded-t-lg'>
      <thead className='text-left text-sm bg-slate-100 dark:bg-slate-100/10 h-10 '>
        <tr>
          {
            column_names.map(
              (c, ix) => (
                <th children={c} key={ix} className={'px-3 ' + (first(ix) ? 'text-left' : (last(ix) ? 'text-right' : 'text-center'))} />
              )
            )
          }
        </tr>  
      </thead>

      <tbody className='font-light text-xs font-mono' >
      {
        rows.map(
          (row, ix) => (
          <tr key={ix} className='border-y border-kf-300/50 h-10'>
            {
              row.map(
                (d, ix) => (
                  <td children={d} key={ix}
                    className={'px-1 tracking-widest --font-semibold text-sm ' + (first(ix) ? 'text-left' : (last(ix) ? 'text-right' : 'text-center'))} />
                )
              )
            }
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

