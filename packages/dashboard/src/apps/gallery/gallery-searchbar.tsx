import { forwardRef, useCallback, 
  useImperativeHandle, useState } from "react"
import { IoReloadSharp } from "react-icons/io5"
import { BlingInput } from "@/comps/common-ui"

export type InnerSearchBarParams = {
  count: number;
  searchTitle: string;
  isLoading: boolean;
  reload: () => void;
};

export type SearchBarProps = {
  count: number;
  searchTitle: string;
  isLoading: boolean;
  reload: () => void;
} & React.ComponentProps<'div'>;

export type ImpInterface = {
  getSearch: () => string;
  setSearch: (value: string) => void;
};


const SearchBar = forwardRef(
  (
    {
      count, reload, searchTitle, isLoading, ...rest 
    }: SearchBarProps, 
    ref
  ) => {

  const [search, setSearch] = useState('')

  useImperativeHandle(
    ref,
    () => (
      {
        getSearch: () => search,
        setSearch: setSearch,
      }
    ),
    [search],
  )

  const onKeyPress: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      var code = (e.keyCode ? e.keyCode : e.which);
      if (e.key === 'Enter') {
          e.preventDefault();
          reload()
      }
    }, [reload]
  );
  

  return (
<div {...rest} >
  <div className={`py-5 w-full text-grey-800 
                  flex flex-row justify-between items-center px-3`}>

    <span children={`${count>=0 ? `(${count})` : ''}`} 
          className='text-2xl w-fit font-mono min-w-[5rem]'/>

    <BlingInput 
      className='m-1 flex-1 max-w-[30rem] h-12' stroke='border-none'
      type='search' placeholder={searchTitle} 
      value={search}
      onChange={e => setSearch(e.currentTarget.value)} 
      onKeyPress={onKeyPress} />          
    <IoReloadSharp 
      className={' bg-kf-500 text-3xl \
                cursor-pointer transition-all duration-300 rounded-full \
                hover:bg-pink-400 text-white \
                p-1.5 hover:p-1 ' + (isLoading ? 'animate-spin' : '') }
      onClick={reload} />
  </div>
</div>
  )
})

export default SearchBar