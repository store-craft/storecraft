import React, { useCallback, useState } from 'react';

export const Button = (
  {
    className='bg-slate-900 dark:bg-pink-500', 
    ...rest
  }: React.ComponentProps<'button'>
) => {
  return (
    <button 
      className={
        'h-9 text-slate-50 dark:text-slate-50 ' +
        'rounded-md shadow-sm border chat-border-overlay ' +
        'capitalize ' +
        'active:scale-[0.98] transition-transform duration-75 ' + 
        'hover:ring-2 hover:ring-pink-400 cursor-pointer ' + className
      }
      {...rest}
    >
    </button>
  )
}
