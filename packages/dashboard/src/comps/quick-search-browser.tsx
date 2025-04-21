import { Bling } from './common-ui'
import { useQuickSearch } from '@storecraft/sdk-react-hooks'
import ShowIf from '@/comps/show-if'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BiSearchAlt } from "react-icons/bi"
import { CiSearch } from "react-icons/ci";
import { MdKeyboardCommandKey } from "react-icons/md";
import { createKeyboardMatchHook } from '../hooks/use-keyboard-match'
import { Overlay } from './overlay'
import { MainPortal } from '../layout'
import { BsArrowReturnLeft } from "react-icons/bs";
import { IoIosArrowRoundUp } from "react-icons/io";
import { useNavigate } from 'react-router-dom'
import { LuSearchX } from "react-icons/lu";
import { QuickSearchResource } from '@storecraft/core/api'
import { db_driver } from '@storecraft/core/database'

const useKeyboardHook_meta_k = createKeyboardMatchHook(
  ['Meta', 'K'], ['Meta', 'k']
);

const useKeyboardHook_ops = createKeyboardMatchHook(
  ['ArrowUp'], ['ArrowDown'], ['Enter'], ['Escape']
);

export type SearchGroupParams = {
  name: string;
  group: QuickSearchResource[];
  /**
   * The group index
   */
  index: number;
  /**
   * The item index
   */
  selectedItemIndex: number;
  /**
   * The item index
   */
  scrollIntoView?: boolean;
  onHover: (groupindex: number, itemIndex: number) => any;
  onClick: (groupindex: number, itemIndex: number) => any;
};
export type QuickSearchBrowserParams = {
  onCancel?: () => any;
  onSelect?: (name: string, value: QuickSearchResource) => any;
};


const resource_to_base_url = {
  'collections': '/pages/collections',
  'customers': '/pages/customers',
  'discounts': '/pages/discounts',
  'orders': '/pages/orders',
  'products': '/pages/products',
  'shipping_methods': '/pages/shipping-methods',
  'storefronts': '/pages/storefronts',
  'tags': '/pages/tags',
  'posts' : '/pages/posts',
  'templates': '/apps/templates',
  'images': '/apps/gallery/img',
} as Record<keyof import('@storecraft/core/database').db_driver["resources"], string>;


export const QuickSearchButton = (
  {
    onClick, ...rest
  }: React.ComponentProps<'div'>
) => {

  const nav = useNavigate();
  useKeyboardHook_meta_k(
    (match) => {
      ref_overlay.current.show();
    }
  );

  const ref_overlay = useRef<import('./overlay.jsx').ImpInterface>(undefined);

  const onSelect: QuickSearchBrowserParams["onSelect"] = useCallback(
    (resource_name, result) => {
      const url = resource_to_base_url[resource_name] + '/' + (result.handle ?? result?.id);
      ref_overlay.current.hide();
      nav(url);
    }, [nav]
  );

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
    <Overlay ref={ref_overlay} key='tomer'>
      <QuickSearchBrowser 
          onCancel={() => ref_overlay.current.hide()} 
          onSelect={onSelect}/>
    </Overlay>
  </MainPortal.PortalChild>        
</div>    
  )
}

const Nada = () => {

  return (
  <div className='text-lg font-normal text-gray-400 h-fit tracking-wider
                  flex flex-col gap-5 justify-center items-center'>
    <LuSearchX className='text-5xl' />                    
    No search Results <br/>were found 😔
  </div>
  )
}


const Footer = () => {

  return (
<div className='w-full flex flex-row items-center
              gap-3 text-xs shelf-text-minor border-t 
              shadow-[0_-2px_5px_0px_rgba(0,0,0,0.16)]
               shelf-border-color p-3'>
  <div className='flex flex-row items-center gap-2'>
    <div className='rounded-md border shelf-border-color px-1 py-px'>
      <BsArrowReturnLeft className='text-sm ' />
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


const to_title: Partial<Record<keyof db_driver["resources"], string>> = {
  'auth_users': 'auth_users',
  'collections': '🗂️ Collections',
  'customers': '💁🏻‍♀️ Customers',
  'discounts': '🎟️ Discounts',
  'images': '🏞️ Images',
  'notifications': '🔔 Notifications',
  'orders': '🛒 Orders',
  'products': '🛍️ Products',
  'shipping_methods': '🚚 Shipping',
  'storefronts': '🏪 Storefronts',
  'tags': '⌗ tags',
  'templates': 'templates',
  'posts' : '📄 Posts'
}


const SearchGroup = (
  {
    name, group, index, selectedItemIndex, onHover, onClick,
    scrollIntoView=true
  }: SearchGroupParams
) => {

  const ref = useRef<HTMLDivElement>(undefined);
  useEffect(
    () => {
      if(scrollIntoView && (selectedItemIndex >= 0)) {
        ref.current.scrollIntoView(
          { 
            behavior: 'instant', 
            block: 'nearest', 
            inline: 'start' 
          }
        );
      }
    }, [selectedItemIndex, scrollIntoView]
  );

  return (
    <div className='--p-3' ref={ref}>
      <span 
        children={to_title[name] ?? name} 
        className='font-bold text-kf-400 text-sm' />
      <div className='w-full flex flex-col gap-2 mt-3 '>
        {
          group.map(
            (it, ix) => (
              <div 
                key={it.id}
                className={
                  `h-14 w-full rounded-md p-3 
                  shadow-sm scroll-auto
                   font-medium text-sm flex flex-row items-center
                   justify-between cursor-pointer
                   ${selectedItemIndex==ix ? 
                    'bg-kf-400 dark:bg-kf-400 text-white' : 
                    'bg-slate-100 dark:bg-[rgb(41,52,69)]'}
                  ` 
                }
                onClick={_ => {onClick && onClick(index, ix)}}
                onMouseMove={(e) => { e.preventDefault(); onHover && onHover(index, ix) }}>

                  <span children={it?.title ?? it?.handle ?? it?.id ?? 'nooop'}  />
                  <BsArrowReturnLeft 
                      className={'text-xl ' + (selectedItemIndex==ix ? 'inline' : 'hidden')} />
              </div>
            )
          )
        }
      </div>
    </div>
  )
}


const QuickSearchBrowser = (
  { 
    onCancel, onSelect
  }: QuickSearchBrowserParams
) => {

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
  const [scrollIntoView, setScrollIntoView] = useState(false);

  const notifySelection = useCallback(
    () => {
      onSelect && onSelect(
        groups[selected.groupIndex].name,
        groups[selected.groupIndex].group[selected.itemIndex]
      );
    }, [onSelect, groups, selected]
  );

  useKeyboardHook_ops(
    (match) => {
      if(groups.length==0)
        return;

      const next = { ...selected };
      const key = match[0];

      if(key=='ArrowDown') {
        if(next.itemIndex + 1 >= groups[next.groupIndex].group.length) {
          next.itemIndex = 0;
          next.groupIndex += 1;
          next.groupIndex %= groups.length;
        } else {
          next.itemIndex += 1;
        }
        setSelected(next);
        setScrollIntoView(true);
      }

      if(key=='ArrowUp') {
        if(next.itemIndex - 1 < 0) {
          next.groupIndex -= 1 - groups.length;
          next.groupIndex %= groups.length;
          next.itemIndex = groups[next.groupIndex].group.length - 1;
        } else {
          next.itemIndex -= 1;
        }
        setSelected(next);
        setScrollIntoView(true);
      }

      if(key==='Escape') {
        onCancel && onCancel();
      }

      if(key==='Enter') {
        notifySelection();
      }
    }
  );

  const onHover: SearchGroupParams["onHover"] = useCallback(
    (groupIndex, itemIndex) => {
      setSelected(
        {
          groupIndex, itemIndex
        }
      );
      setScrollIntoView(false);
    }, []
  );

  const onItemClick: SearchGroupParams["onClick"] = useCallback(
    (groupIndex, itemIndex) => {
      setSelected(
        {
          groupIndex, itemIndex
        }
      );
      onSelect && onSelect(
        groups[groupIndex].name,
        groups[groupIndex].group[itemIndex]
      );
    }, [onSelect, groups]
  );

  const ref_input = useRef<HTMLInputElement>(undefined);

  const onSubmit = useCallback(
    (e: React.SyntheticEvent) => {
      e?.preventDefault()
      const search_terms = ref_input.current.value;

      query({ limit: 5, vql: search_terms })
    }, [query]
  );


  return (
<div className='w-full h-full relative'>
  <div onClick={e => e.stopPropagation()} 
      className='w-full --m-3 md:w-[35rem] --h-4/5 h-fit
                  shelf-plain-card-soft absolute top-20 left-1/2 -translate-x-1/2
                  rounded-xl --p-3 --sm:p-5 border shadow-lg --gap-5 
                  text-base flex flex-col --overflow-hidden'>

    <div className='w-full h-fit flex flex-col gap-5 px-3 pt-3'>

      <form 
        autoFocus
        className='w-full h-fit' 
        tabIndex={4344}>
            
        <Bling rounded='rounded-xl' stroke='border' >
          <div className='flex flex-row justify-between items-center'>
            <input 
              onChange={onSubmit} 
              autoFocus
              ref={ref_input} 
              type='search' 
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

      <div className='w-full h-fit '>

        <div className={`flex flex-col gap-5 w-full h-fit`}>

          <div className='w-full --h-full max-h-[50svh] overflow-y-auto 
                          px-1 flex flex-col gap-5 pb-5'>

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
                    scrollIntoView={scrollIntoView}
                    selectedItemIndex={selected.groupIndex==ix ? selected.itemIndex : -1}
                    onHover={onHover} 
                    onClick={onItemClick} 
                  />
                )
              )
            }
          </div>  

        </div>
              
      </div>

    </div>       

    <Footer />  

  </div>
</div>
  )
}


export default QuickSearchBrowser