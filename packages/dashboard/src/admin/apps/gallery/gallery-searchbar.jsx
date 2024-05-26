import { forwardRef, useCallback, 
  useImperativeHandle, useState } from "react"
import { IoReloadSharp } from "react-icons/io5/index.js"
import { BlingInput } from "@/admin/comps/common-ui.jsx"

/**
 * @typedef {object} ImpInterface
 * @prop {() => string} getSearch
 * @prop {(value: string) => void} setSearch
 */

const SearchBar = forwardRef(
  /**
   * 
   * @typedef {object} InnerSearchBarParams
   * @prop {number} count
   * @prop {string} searchTitle
   * @prop {boolean} isLoading
   * @prop {() => void} reload
   * 
   * @param {InnerSearchBarParams & 
   *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
   * } params
   * @param {*} ref 
   * 
   */
  (
    {
      count, reload, searchTitle, isLoading, ...rest 
    }, ref
  ) => {

  const [search, setSearch] = useState('')

  useImperativeHandle(
    ref,

    /**
     * @returns {ImpInterface}
     */
    () => (
      {
        getSearch: () => search,
        setSearch: setSearch,
      }
    ),
    [search],
  )

  /** @type {React.KeyboardEventHandler<HTMLInputElement>} */
  const onKeyPress = useCallback(
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