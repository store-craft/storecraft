import { forwardRef, useCallback, 
  useState, useImperativeHandle } from 'react'
import { MdNavigateNext } from 'react-icons/md/index.js'
import { IoCreateOutline, IoReloadSharp } from 'react-icons/io5/index.js'
import { Link } from 'react-router-dom'
import { BlingButton2, 
  PromisableLoadingButton } from './common-button.jsx'
import { BlingInput } from './common-ui.jsx'

export type ImperativeInterface = {
  getSearch: () => string;
  setSearch: (value: string) => void;
};
export type TopActionsParams = {
  reload: () => void;
  searchTitle: string;
  isLoading: boolean;
  createLink?: string;
  className?: string;
  isCollectionEmpty?: boolean;
};
export type BottomActionsParams = {
  next: () => Promise<any>;
  prev: () => Promise<any>;
  limit?: number;
  onLimitChange: (v: number) => void;
  className?: string;
};


export const TopActions = forwardRef(
  (
    {
      reload, searchTitle, isLoading, createLink='', className='',
      isCollectionEmpty=false 
    }: TopActionsParams, ref
  ) => {

  const [search, setSearch] = useState('');

  useImperativeHandle(
    ref,
    () => ({
      getSearch: () => search,
      setSearch: setSearch,
    }),
    [search],
  );

  const onKeyPress: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code == 13) {
          e.preventDefault();
          reload()
      }
    }, [reload]
  );

  return (
<div className={className}>
  <div className={`--border-x  --bg-kf-50 w-full text-grey-800 
                  flex flex-row justify-between items-center px-0 --border-t`}>
    <Link to={createLink} draggable='false' className="m-2">
      <div className={isCollectionEmpty ? 'animate-[wave_1.5s_ease-in-out_infinite]' : ''}>
        <BlingButton2
          className='h-9 w-16 text-base rounded-lg' 
          stroke='border-2' 
          children='add'
          icon={
            <IoCreateOutline 
                className='inline shelf-text-label-color 
                          text-xl text-grey-800'/>
          }
        />
      </div>

    </Link>            
    <BlingInput 
      className='m-1 flex-1 h-fit max-w-[20rem]' 
        rounded='rounded-md'
        type='search' placeholder={searchTitle} 
        value={search ?? ''}
        onChange={e => setSearch(e.currentTarget.value)} 
        onKeyPress={onKeyPress} 
        inputClsName='h-9 hover:ring-pink-400 hover:ring-2' />        

    <IoReloadSharp 
      className={' bg-kf-500 text-3xl mx-3 \
          cursor-pointer transition-all duration-300 rounded-full \
            md:hover:bg-pink-500 text-white \
            hover:p-1 ' + (isLoading ? 'animate-spin p-1 bg-pink-500' : 'p-1.5') }
      onClick={reload} 
     />
  </div>
</div>
  )
})

export const BottomActions = (
  { 
    next, prev, limit=5, onLimitChange, className='' 
  }: BottomActionsParams
) => {
  
  const _onLimitChange: React.ChangeEventHandler<HTMLSelectElement> = useCallback(
    (e) => {
      const l = parseInt(e.target.value)
      onLimitChange && onLimitChange(l)
    }, [onLimitChange]
  );
  
  return (
  <div className={`h-fit --bg-slate-50 py-3 w-full flex
                   flex-row justify-between items-center px-3 
                   ${className}`}>
    <PromisableLoadingButton 
        Icon={<MdNavigateNext className='rotate-180 scale-150 cursor-pointer' />} 
        text='' className='text-lg' onClick={prev} />
    <select 
        name='limit' 
        onChange={_onLimitChange} value={limit} 
        className='m-1 h-8 px-4 rounded-md text-sm 
                  bg-slate-50 dark:bg-slate-800 
                  --border focus:outline-none'>
      <option value='5'>5</option>
      <option value='10'>10</option>
      <option value='15'>15</option>
      <option value='20'>20</option>
    </select>                    
    <PromisableLoadingButton 
        Icon={<MdNavigateNext className='scale-150' />} text=''
        className='text-lg cursor-pointer' 
        onClick={next} />
  </div>
  )
}
