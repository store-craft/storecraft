import React, { useCallback } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Button } from './common-button.jsx'
import { to_slug } from '../utils/index.js'
import { AiOutlineCloseCircle } from 'react-icons/ai/index.js'
import { RiDashboardFill } from 'react-icons/ri/index.js'
import { FiSettings } from 'react-icons/fi/index.js'
import { Logo } from './logo.jsx'
import { useBreakpointValue } from '../hooks/use-media-query.js'

/**
 * 
 * @typedef {object} MenuItemType
 * @prop {string} name
 * @prop {string} [slug]
 * @prop {React.JSX.Element} [icon]
 * @prop {object} [extra]
 * @prop {MenuItemType[]} [items]
 * 
 * 
 * @typedef {object} MenuType
 * @prop {MenuItemType[]} items
 * @prop {object} info
 * @prop {string} [info.name]
 * @prop {React.JSX.Element} [info.icon]
 * 
 */

/**
 * 
 * @typedef {object} InnerSideMenuParams
 * @prop {MenuType} menu
 * @prop {() => void} onCloseClick
 * 
 * 
 * @param {InnerSideMenuParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
const SideMenu = (
  { 
    className, onCloseClick, menu : { items, info } 
  }
) => {

  const is_gt_md = useBreakpointValue('md', true, false);
  let location = useLocation();
  const nav = useNavigate();
  const getExtra = useCallback(
    /**
     * @param {string} slug 
     * @param {any} item 
     */
    (slug, item) => {
      const hit = location.pathname.includes(slug);
      const g = item?.extra ?? { active: 'bg-pink-600' }
      const hh = hit ? `${g?.active} text-white` : 'shelf-side-hover ';
      return hh;
    }, [location]
  );

  /** @type {React.MouseEventHandler<SVGElement>} */
  const onSettingsClicked = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      nav('/settings')
    }, [nav]
  );

  /** @type {React.MouseEventHandler<HTMLButtonElement>} */
  const onDashboardClicked = useCallback(
    (e) => {
      e.preventDefault()
      !is_gt_md && onCloseClick()
      nav('/home')
    }, [nav, is_gt_md, onCloseClick]
  );

  return (
<div className={`relative w-64 --scrollbar-none overflow-clip
                 flex flex-col
                 ${className}`}>
  <Logo />                  
  <AiOutlineCloseCircle 
      className='absolute bg-kf-500 text-3xl top-4 right-2 
        cursor-pointer transition-all duration-300 rounded-full 
      hover:bg-pink-400 text-white 
        p-1.5 hover:p-1 md:hidden' 
      onClick={onCloseClick} />

  <div className='w-full flex-1 overflow-clip hover:overflow-y-auto max-h-full'>
    <div className='mt-3 pl-5 pr-1 w-full h-fit'>
      <Button 
          icon={<RiDashboardFill 
          className='text-xl ml-0 --text-pink-600'/>} 
          text='Dashboard'
          className={`w-full my-2 py-2 pr-3 text-base 
              font-normal ${getExtra('/home', undefined)}`} 
          onClick={onDashboardClicked}>
        <FiSettings className='text-lg' onClick={onSettingsClicked} />
      </Button>

    {
    items.map(
      (g, ix) => (
      <div className='w-full' key={g.name}>
        <p children={g.name} 
          className='uppercase text-base font-light 
                      tracking-normal text-gray-400' />
        {
          g.items.map(
            (item, ij) => {
              const slug = `/${to_slug(g.name)}/${to_slug(item.slug ?? item.name)}`
              return (
              <Link key={slug} to={slug} draggable='false'>
                <Button 
                    icon={
                      (
                      <div 
                          className='rounded-md border dark:border-none p-[3px] 
                                    --shelf-border-color-soft ' 
                          children={item.icon} />
                      )
                    } 
                    text={item.name} key={ij}
                    className={`w-full my-px px-1.5 py-1.5 text-base 
                        font-normal ${getExtra(slug, item)}`} 
                    onClick={e => !is_gt_md && onCloseClick() }/>
                  
              </Link>
              )
            }
          )
        }
      </div>
      )
    )
    }
    </div>
  </div>
</div>
  )
}

export default SideMenu