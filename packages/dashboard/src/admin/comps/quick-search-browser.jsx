import { Bling } from './common-ui.jsx'
import { useCollection, useQuickSearch } from '@storecraft/sdk-react-hooks'
import ShowIf from '@/admin/comps/show-if.jsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IoCloseSharp } from "react-icons/io5/index.js"
import { BlingButton, PromisableLoadingButton } from "./common-button.jsx"
import { BiSearchAlt } from "react-icons/bi/index.js"
import { App } from '@storecraft/core'
import { CiSearch } from "react-icons/ci/index.js";
import { MdKeyboardCommandKey } from "react-icons/md/index.js";
import { createKeyboardMatchHook } from '../hooks/useKeyboardMatch.js'
import { Overlay } from './overlay.jsx'
import { MainPortal } from '../layout.jsx'
import { IoIosReturnLeft } from "react-icons/io/index.js";
import { IoIosArrowRoundUp } from "react-icons/io/index.js";


const useKeyboardHook_meta_k = createKeyboardMatchHook(['Meta', 'K'], ['Meta', 'k']);
const useKeyboardHook_ops = createKeyboardMatchHook(['ArrowUp'], ['ArrowDown'], ['Enter'], ['Escape']);

/**
 * 
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>} params
 */
export const QuickSearchButton = (
  {
    onClick, ...rest
  }
) => {
  const [open, setOpen] = useState(false);

  useKeyboardHook_meta_k(
    (match) => {
      console.log(match)
      ref_overlay.current.show();
    }
  );

  /** @type {React.MutableRefObject<import('./overlay.jsx').ImpInterface>} */
  const ref_overlay = useRef();

  return (
<div 
    onClick={() => {ref_overlay.current.show()}} 
    {...rest}  >
  <div className='rounded-md flex flex-row gap-2 p-1 items-center 
                  border shelf-card shelf-text-minor text-sm
                  cursor-pointer hover:ring-pink-400 hover:ring-2'>
    <CiSearch/> 
    <span children='Search' />
    <div className='rounded-md border flex flex-row 
                    items-center px-2 shelf-card'>
      <MdKeyboardCommandKey />
      <span children='K' />
    </div>
  </div>
  <MainPortal.PortalChild>        
    <Overlay ref={ref_overlay}>
      <BrowseProducts 
          onSave={undefined} 
          onCancel={() => ref_overlay.current.hide()} />
    </Overlay>
  </MainPortal.PortalChild>        
</div>    
  )
}

const Nada = () => {

  return (
  <div className='text-3xl font-medium text-gray-400 h-full 
                  flex justify-center items-center'>
    No search Results <br/>were found <br/> :()
  </div>
  )
}


const Footer = () => {

  return (
<div className='w-full flex flex-row items-center 
              gap-3 text-sm shelf-text-minor'>
  <div className='flex flex-row items-center gap-2'>
    <div className='rounded-md border shelf-border-color px-0.5'>
      <IoIosReturnLeft className='text-lg ' />
    </div>
    <span children='to select' />
  </div>
  <div className='flex flex-row items-center gap-2'>
    <div className='flex flex-row items-center rounded-md 
              border shelf-border-color'>
      <IoIosArrowRoundUp className='text-lg' />
      <IoIosArrowRoundUp className='rotate-180 text-lg' />
    </div>
    <span children='to navigate' />
  </div>
  <div className='flex flex-row items-center gap-1'>
    <span children='esc' 
        className='font-bold font-mono rounded-md 
                border shelf-border-color px-1' />
    <span children='to close' />
  </div>
</div>    
  )
}


/**
 * `BrowseCollection` is used to :
 * - **view** and **select** items in big collections
 * - Infinite pagination 
 * - query and filtering with `vql` search query
 * - designed to be used inside a popup modal.
 * 
 * @template {import('@storecraft/core/v-api').BaseType} [T=import('@storecraft/core/v-api').BaseType]
 * 
 * 
 * @typedef {object} BrowseCollectionParams
 * @prop {keyof App["db"]["resources"]} resource
 * @prop {string} [title]
 * @prop {React.FC<{data: object}>} [Comp]
 * @prop {(v: T[]) => void} onSave
 * @prop {() => void} onCancel
 */

/**
 * @typedef {object} ItemWrapper
 * @prop {import('@storecraft/core/v-database').QuickSearchResource} [payload]
 * @prop {string} resource
 */


/**
 * 
 * @typedef {object} SearchGroupParams
 * @prop {string} name
 * @prop {import('@storecraft/core/v-database').QuickSearchResource[]} group
 * @prop {number} index The group index
 * @prop {number} selectedItemIndex The item index
 * @prop {(groupindex: number, itemIndex: number) => any} onHover 
 * 
 * @param {SearchGroupParams} params
 */
const SearchGroup = (
  {
    name, group, index, selectedItemIndex, onHover
  }
) => {

  /** @type {React.LegacyRef<HTMLDivElement>} */
  const ref = useRef();
  useEffect(
    () => {
      if(selectedItemIndex >= 0)
        ref.current.scrollIntoView();
    }, [selectedItemIndex]
  )

  return (
    <div className='--p-3' ref={ref}>
      <span children={name} className='font-bold text-kf-400' />
      <div className='w-full flex flex-col gap-2 mt-3 '>
        {
          group.map(
            (it, ix) => (
              <div 
                key={it.id}
                children={it?.title ?? it?.id ?? it?.handle ?? 'nooop'} 
                className={
                  `h-14 w-full rounded-md p-3 
                  shadow-sm scroll-auto
                   font-medium flex flex-row items-center
                   ${selectedItemIndex==ix ? 'bg-kf-400 dark:bg-kf-400 text-white' : 'bg-slate-100 dark:bg-[rgb(41,52,69)]'}
                  ` 
                }
                onMouseOver={() => { onHover(index, ix) }}/>
            )
          )
        }

      </div>
    </div>
  )
}

/** 
 * @template {import('@storecraft/core/v-api').BaseType} [T=import('@storecraft/core/v-api').BaseType]
 * 
 * @param {BrowseCollectionParams<T>} params
 */
const QuickSearchBrowser = (
  { 
    title='Browse products', Comp, onSave, onCancel 
  }
) => {

  const [focus, setFocus] = useState(false)
  const [limit, setLimit] = useState(5);

  const { 
    result, loading, error, 
    actions: {
      query
    }
  } = useQuickSearch();

  const groups = useMemo(
    () => Object.entries(result ?? {}).map(
      it => (
        {
          group: it[1],
          name: it[0]
        }
      )
    )
    , [result]
  );

  const [selected, setSelected] = useState({ groupIndex: 0, itemIndex: 0});
  useKeyboardHook_ops(
    (match) => {
      const next = { ...selected };
      if(match[0]=='ArrowDown') {
        if(next.itemIndex + 1 >= groups[next.groupIndex].group.length) {
          next.itemIndex = 0;
          next.groupIndex += 1;
          next.groupIndex %= groups.length;
        } else {
          next.itemIndex += 1;
        }
        setSelected(next);
      }

      if(match[0]=='ArrowUp') {
        if(next.itemIndex - 1 < 0) {
          next.groupIndex -= 1 - groups.length;
          next.groupIndex %= groups.length;
          next.itemIndex = groups[next.groupIndex].group.length - 1;
        } else {
          next.itemIndex -= 1;
        }
        setSelected(next);
      }

    }
  );

  const onHover = useCallback(
    (groupIndex, itemIndex) => {
      setSelected(
        {
          groupIndex, itemIndex
        }
      )
    }, []
  );
  

  /** @type {React.LegacyRef<HTMLInputElement>} */
  const ref_input = useRef()

  /** @type {React.EventHandler<React.SyntheticEvent>} */
  const onSubmit = useCallback(
    (e) => {
      e?.preventDefault()
      const search_terms = ref_input.current.value;

      query({ limit, vql: search_terms })
    }, [limit, query]
  );

  const onKeyPress = useCallback(
    (e) => {
      onCancel()
      if(e.key === "Escape") {
      }
    }, []
  );
  
  return (
<div onClick={e => e.stopPropagation()} 
     className='w-full m-3 md:w-[35rem] h-3/4 
     shelf-plain-card-soft
                rounded-xl p-3 sm:p-5 border shadow-lg gap-5 
                text-base flex flex-col --overflow-hidden'>

  {/* <p children={title} className='pb-3 border-b shelf-border-color-soft' /> */}
  <form 
      onSubmit={onSubmit} 
      className='w-full' 
      onFocus={() => setFocus(true)} 
      tabIndex={4344}>
        
    <Bling rounded='rounded-xl' stroke='border' >
      <div className='flex flex-row justify-between items-center'>
        <input 
            ref={ref_input} type='search' 
            placeholder='search' 
            className='w-full h-12 border shelf-input-color 
                      shelf-border-color-soft px-3 text-xl font-medium 
                      focus:outline-none rounded-xl'  />
        <BiSearchAlt 
                className='text-white text-4xl mx-1 sm:mx-5 
                           cursor-pointer' 
                onClick={onSubmit}/>
      </div>
    </Bling>
  </form>

  <div className='relative w-full flex-1 --bg-gray-50 '>

    <div className={`flex flex-col gap-5 absolute inset-0 w-full h-full 
                   --bg-white ${(focus ? '' : '--hidden')}`}>

      {/* <div className='flex flex-row justify-between'>
        <p children={`Select from search results ` + (queryCount>=0 ? `(${queryCount})` : '')}
                className='font-semibold text-base '/>
        <IoCloseSharp 
            className='h-6 w-9 pl-3 border-l 
                  shelf-border-color-soft cursor-pointer' 
            onClick={() => setFocus(false)}/>
      </div> */}

      {/* <Bling rounded='rounded-lg'
             className='flex-1 overflow-y-auto'> */}
        <div className='w-full h-full overflow-y-auto px-1 flex flex-col gap-5 '>

          <ShowIf show={groups.length==0 && !loading}>
            <Nada />
          </ShowIf>

          {
          groups.map(
            (it, ix) => (
              <SearchGroup 
                  key={it.name} 
                  name={it.name} 
                  group={it.group} 
                  index={ix} 
                  selectedItemIndex={selected.groupIndex==ix ? selected.itemIndex : -1}
                  onHover={onHover} />
            )
          )
          }
          {/* <PromisableLoadingButton 
              text='Load more' 
              onClick={() => next().catch(e => {}) } 
              keep_text_on_load={true}
              className='w-fit mx-auto h-12 p-3 border-b cursor-pointer
                          shelf-border-color-soft
                          text-center text-pink-500 font-medium text-base'  /> */}

        </div>    
      {/* </Bling>   */}
      <Footer />  
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
 * @prop {(v: import('@storecraft/core/v-api').CustomerType[]) => void} onSave
 * @prop {() => void} onCancel
 * 
 * @param {BrowseCustomersParams} params 
 */
export const BrowseCustomers = ({ onSave, onCancel }) => {

  return (
  <QuickSearchBrowser 
      resource='customers' 
      Comp={UserComp} 
      onSave={onSave} 
      onCancel={onCancel} 
      title='Browse Customers' />    
  )
}

/**
 * @typedef {object} BrowseProductsParams
 * @prop {(v: import('@storecraft/core/v-api').ProductType[]) => void} onSave
 * @prop {() => void} onCancel
 * 
 * @param {BrowseProductsParams} params
 */
export const BrowseProducts = (
  { 
    onSave, onCancel 
  }
) => {

  return (
<QuickSearchBrowser 
    resource='products' 
    Comp={ProductComp} 
    onSave={onSave} 
    onCancel={onCancel} 
    title='Browse Products' />    
  )
}

export default QuickSearchBrowser