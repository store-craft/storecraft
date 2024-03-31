import { forwardRef, useCallback, 
         useImperativeHandle,
         useState } from "react"
import { IoReloadSharp } from "react-icons/io5/index.js"
import { Bling, BlingInput } from "@/admin/comps/common-ui.jsx"

const SearchBar = forwardRef(
  ({count, reload, searchTitle, isLoading, className }, ref) => {
  const [search, setSearch] = useState('')

  useImperativeHandle(
    ref,
    () => ({
      getSearch: () => search,
      setSearch: setSearch,
    }),
    [search],
  )

  const onKeyPress = useCallback(
    (e) => {
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code == 13) {
          e.preventDefault();
          reload()
      }
  }, [reload])
  

  return (
<div className={className}>
  <div className={`py-5 w-full text-grey-800 
                  flex flex-row justify-between items-center px-3`}>

    <span children={`${count>=0 ? `(${count})` : ''}`} 
          className='text-2xl w-fit font-mono min-w-[5rem]'/>

    <BlingInput 
        className='m-1 flex-1 max-w-[30rem] h-12' stroke='p-0'
        type='search' placeholder={searchTitle} 
        value={search}
        onChange={e => setSearch(e.currentTarget.value)} 
        onKeyPress={onKeyPress} />          
    <IoReloadSharp className={' bg-kf-500 text-3xl \
            cursor-pointer transition-all duration-300 rounded-full \
             hover:bg-pink-400 text-white \
            p-1.5 hover:p-1 ' + (isLoading ? 'animate-spin' : '') }
            onClick={reload} />
            
  </div>
</div>
  )
})

export default SearchBar