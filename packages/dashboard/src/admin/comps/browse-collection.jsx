import { Bling } from './common-ui.jsx'
import { useCommonCollection } from '@/shelf-cms-react-hooks/index.js'
import ShowIf from '@/admin/comps/show-if.jsx'
import { useCallback, useMemo, useRef, useState } from 'react'
import { IoCloseSharp } from "react-icons/io5/index.js"
import { BlingButton, PromisableLoadingButton } from "./common-button.jsx"
import { BiSearchAlt } from "react-icons/bi/index.js"

/**
 * `BrowseCollection` is used to view and select big collections
 * with pagination and `vql` search query
 * 
 * @typedef {object} BrowseCollectionParams
 * @prop {string} collectionId
 * @prop {string} [title]
 * @prop {React.FC<any>} [Comp]
 * @prop {(v: import('@storecraft/core/v-api').BaseType[]) => void} onSave
 * @prop {() => void} onCancel
 * 
 * 
 * @param {BrowseCollectionParams} param
 */
const BrowseCollection = (
  { 
    collectionId, title='Browse products', Comp, onSave, onCancel 
  }
) => {

  const [focus, setFocus] = useState(false)
  /**@type {ReturnType<typeof useState<import('@storecraft/core/v-api').BaseType[]>>} */
  const [selected, setSelected] = useState([]);
  const [limit, setLimit] = useState(5)
  const { 
    pages, page, loading, error, 
    prev, next, query, queryCount, deleteDocument 
  } = useCommonCollection(collectionId, true);

  const onAdd = useCallback(
    /** @param {import('@storecraft/core/v-api').BaseType} item */
    (item) => {
      setSelected(
        vs => [item, ...vs.filter(it => it.id!==item.id)]
      );
      setFocus(false)
    }, []
  );

  const onRemove = useCallback(
    /** @param {import('@storecraft/core/v-api').BaseType} item */
    (item) => {
      setSelected( vs => vs.filter(it => it.id!==item.id))
    }, []
  );
  
  // console.log('pages', pages);
  const items = useMemo(
    () => pages.reduce((prev, curr) => [...prev, ...curr], [])
    , [pages]
  )

  /** @type {React.LegacyRef<HTMLInputElement>} */
  const ref_input = useRef()

  /** @type {React.EventHandler<React.SyntheticEvent>} */
  const onSubmit = useCallback(
    (e) => {
      e?.preventDefault()
      const search_terms = ref_input.current.value;

      query({ limit, vqlString: search_terms })
    }, [limit, query]
  )

  const onKeyPress = useCallback(
    (e) => {
      onCancel()
      if(e.key === "Escape") {
      }
    }, []
  )
  return (
<div onClick={e => e.stopPropagation()} 
     className='w-full m-3 md:w-[35rem] h-3/4 
     shelf-plain-card-soft
                rounded-xl p-3 sm:p-5 border shadow-lg gap-5 
                text-base flex flex-col overflow-hidden'>

  <p children={title} className='pb-3 border-b shelf-border-color-soft' />
  <form 
      onSubmit={onSubmit} className='w-full' 
      onFocus={() => setFocus(true)} 
      tabIndex={4344}>
        
    <Bling rounded='rounded-xl' stroke='p-0.5' >
      <div className='flex flex-row justify-between items-center'>
        <input ref={ref_input} type='search' 
          placeholder='search' 
          className='w-full h-12 border shelf-input-color 
                     shelf-border-color-soft px-3 text-base 
                     focus:outline-none rounded-xl'  />
        <BiSearchAlt 
                className='text-white text-4xl mx-1 sm:mx-5 
                           cursor-pointer' 
                onClick={onSubmit}/>
      </div>
    </Bling>
  </form>

  <div className='relative w-full flex-1 --bg-gray-50 '>
    <div className={`absolute inset-0 flex flex-col w-full gap-5 h-full
                    ${!focus ? '' : 'hidden'}` }>
      <p children='Selected items' 
          className=' font-semibold text-base --text-gray-500'/>
      <div className='w-full flex-1 rounded-xl border shelf-border-color-soft 
                      overflow-y-auto'>
        <ShowIf show={selected.length==0}>
          <div className='text-xl sm:text-3xl font-medium text-gray-400 
                          h-full flex flex-col justify-center 
                          items-center gap-5'>
            No Selected items, <br/>Tap the Search box
            <BiSearchAlt 
                className='text-inherit text-5xl opacity-50 
                           mx-5 cursor-pointer' 
                onClick={onSubmit}/>
          </div>
        </ShowIf>
    {
    selected.map(
      (it, ix) => (
      <div key={it.id} 
          className='w-full h-16 sm:h-20 p-1 border-b shelf-border-color-soft 
                     flex flex-row justify-between items-center 
                     gap-3' >
        <Comp data={it} />
        <IoCloseSharp onClick={() => onRemove(it)} 
                className='h-6 w-9 pl-3 border-l shelf-border-color-soft
                            cursor-pointer'/>
      </div>
      )
    )
    }
      </div>
      <div className='self-end flex flex-row gap-5'>
        <BlingButton 
            stroke='p-0.5' 
            className='opacity-60' 
            children='cancel' 
            onClick={onCancel} />
        <BlingButton 
            stroke='p-0.5' 
            children='save' 
            onClick={() => onSave(selected)} />
      </div>
    </div>   

    <div className={`flex flex-col gap-5 absolute inset-0 w-full h-full 
                   --bg-white ${(focus ? '' : 'hidden')}`}>
      <div className='flex flex-row justify-between'>
        <p children={`Select from search results ` + (queryCount>=0 ? `(${queryCount})` : '')}
                className='font-semibold text-base '/>
        <IoCloseSharp 
            className='h-6 w-9 pl-3 border-l 
                  shelf-border-color-soft cursor-pointer' 
            onClick={() => setFocus(false)}/>
      </div>
      <Bling rounded='rounded-xl'
             className='flex-1 overflow-y-auto'>
        <div className='w-full h-full rounded-xl border shelf-plain-card-soft
                        overflow-y-auto '>
          <ShowIf show={items.length==0 && !loading}>
            <div className='text-3xl font-medium text-gray-400 h-full 
                            flex justify-center items-center'>
              No search Results <br/>were found <br/> :()
            </div>
          </ShowIf>
          {
          items.map(
            (it, ix) => (
            <div key={`sr_${it.id}`} 
                className='w-full h-16 sm:h-20 p-1 border-b shelf-border-color-soft
                           cursor-pointer'
                onClick={() => onAdd(it)}>
              <Comp data={it} />
            </div>
            )
          )
          }
          <PromisableLoadingButton 
                text='Load more' 
                onClick={() => next().catch(e => {})} 
                keep_text_on_load={true}
                className='w-fit mx-auto h-12 p-3 border-b cursor-pointer
                           shelf-border-color-soft
                           text-center text-pink-500 font-medium text-base'  />

        </div>    
      </Bling>    
    </div>        
  </div>        
</div>
  )
}

/**
 * 
 * @param {object} param
 * @param {import('@storecraft/core/v-api').CustomerType} param.data
 */
const UserComp = ({ data }) => {
  return (
<div className='w-full h-full flex flex-row justify-between 
                items-center text-sm gap-3'>
  <span className='text-base overflow-x-auto 
                   whitespace-nowrap h-full 
                   flex flex-row items-center pr-3 flex-1' 
        children={`${data.firstname} ${data.lastname}`} />
  
  <span className='text-gray-500 max-w-[8rem] sm:max-w-none 
                   overflow-x-auto whitespace-normal h-full 
                   flex flex-row items-center' 
        children={`(${data.auth_id})`} />
</div>    
  )
}

/**
 * 
 * @param {object} param
 * @param {import('@storecraft/core/v-api').ProductType} param.data
 */
const ProductComp = ({ data }) => {
  return (
<div className='w-full h-full flex flex-row justify-between 
                items-center text-sm '>
  <span className='text-base max-w-xs overflow-x-auto 
                   whitespace-normal overflow-y-auto h-full 
                   flex flex-row items-center pr-1' 
        children={data.title} />
  <span className='text-gray-500 whitespace-nowrap' 
        children={`(${data.qty} In stock)`} />
</div>    
  )
}

/**
 * @typedef {object} BrowseCustomersParams
 * @prop {(v: import('@storecraft/core/v-api').BaseType[]) => void} onSave
 * @prop {() => void} onCancel
 * 
 * @param {BrowseCustomersParams} param0 
 */
export const BrowseCustomers = ({ onSave, onCancel }) => {

  return (
<BrowseCollection 
        collectionId='customers' Comp={UserComp} 
        onSave={onSave} onCancel={onCancel} 
        title='Browse Customers' />    
  )
}

/**
 * @typedef {object} BrowseProductsParams
 * @prop {(v: import('@storecraft/core/v-api').BaseType[]) => void} onSave
 * @prop {() => void} onCancel
 * 
 * @param {BrowseProductsParams} param0 
 */
export const BrowseProducts = ({ onSave, onCancel }) => {

  return (
<BrowseCollection 
    collectionId='products' Comp={ProductComp} 
    onSave={onSave} onCancel={onCancel} 
    title='Browse Products' />    
  )
}

export default BrowseCollection