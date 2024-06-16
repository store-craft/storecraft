import Link from 'next/link.js'
import { GrInstall, GrArticle } from 'react-icons/gr/index.js'
import { BsNewspaper } from 'react-icons/bs/index.js'
import { BiLogoFirebase } from 'react-icons/bi/index.js'
import { TbBrandFirebase } from 'react-icons/tb/index.js'
import { MdOutlineSchema } from 'react-icons/md/index.js'
import { AiOutlineDatabase } from 'react-icons/ai/index.js'
import { MdAdminPanelSettings } from 'react-icons/md/index.js'
import { DiStackoverflow } from 'react-icons/di/index.js'
import { FaServer } from 'react-icons/fa/index.js'
import { useMemo } from 'react'

/**
 * @typedef {object} Item
 * @property {string} title
 * @property {string} route
 * @property {string} path
 * 
 * @typedef {object} Group
 * @property {string} title
 * @property {object} icon
 * @property {string} icon.name
 * @property {object} icon.params
 * @property {Item[]} items
 */


const Icon = (
  { 
    name, ...rest 
  }
) => {

  switch (name) {
    case 'BsNewspaper':
      return <BsNewspaper {...rest}  />
    case 'BiLogoStackOverflow':
      return <DiStackoverflow {...rest}  />
    case 'BiLogoFirebase':
      return <AiOutlineDatabase {...rest} />
    case 'MdAdminPanelSettings':
      return <MdAdminPanelSettings {...rest} />
    case 'FaServer':
      return <FaServer {...rest} />
  }
}

/**
 * @typedef {object} HeaderParams
 * @prop {Group} group
 * @prop {boolean} [selected=false]
 * 
 * @param {HeaderParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params 
 */
const Header = (
  { 
    group, selected=false, ...rest 
  }
) => {

  const {title, items, icon} = group;

  return (
<div {...rest}>    
  <div className='flex flex-row items-center gap-2 px-2 cursor-pointer'>
    <div className={` p-1 dark:text-slate-300 
                   rounded-md border
                  ${selected ? ' border-white/80 dark:border-white/10 bg-gradient-to-br from-kf-500 to-pink-500/20 dark:to-kf-500/20 dark:from-pink-500 text-white dark:text-white/70' : 'text-kf-400 border-kf-500/20 dark:border-pink-500/40'}`
                  }>
      <Icon {...icon} />
    </div>                
    <div 
      className={`text-xs font-old2 opacity-95 font-semibold 
              w-full tracking-wide ${selected ? 'text-kf-700 dark:text-pink-400' : ''}`}
      children={title.toUpperCase()} />

  </div>    
</div>    
  )
}

/**
 * @typedef {object} Link2Params
 * @prop {string} title
 * @prop {boolean} [selected=false]
 * 
 * @param {Link2Params & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
 * } params
 */
const Link2 = (
  { 
    title, selected=false, ...rest 
  }
) => {

  return (
<p {...rest}
    className={`text-sm  font-medium px-2 
                py-1 rounded-md
                ${selected ? 
                  `bg-kf-50 dark:bg-kf-500 
                    text-kf-700 
                  dark:text-gray-100` : 
                  'bg-transparent'
                }`}
    children={title} />
  )
}

/**
 * @typedef {object} SideGroupParams
 * @prop {Group} group
 * @prop {string} selectedSlug
 * @prop {(item: Item) => any } onClickMenuItem
 * 
 * 
 * @param {SideGroupParams &
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
const SideGroup = (
  { 
    onClickMenuItem, selectedSlug, group, ...rest 
  }
) => {

  const {title, items, icon} = group;

  return (
    <div {...rest}>

      <div className='flex flex-col w-full gap-2 mt-10'>
        { 
          items.map(
            (item, index) => 
              <Link key={index} href={`${item.route}`} 
                    alt={item.title}
                    title={item.title}>
                <Link2 onClick={e => { onClickMenuItem && onClickMenuItem(item)}} 
                       selected={item.route===selectedSlug}
                       title={item.title} />
              </Link>
          )
        }
      </div>

    </div>
  )
}


/**
 * @typedef {object} SideBarParams
 * @prop {Group[]} groups
 * @prop {string} selectedSlug
 * @prop {(item: Item) => any } [onClickMenuItem]
 * 
 * 
 * @param {SideBarParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
 * } params
 *  
 */
const SideBar = (
  { 
    className, onClickMenuItem, selectedSlug, groups=[], 
    ...rest 
  }
) => {

  const selected_group = useMemo(
    () => groups.findIndex(
      g => {
        return g.items.find(
          it => it.route===selectedSlug
        )!==undefined
      }
    ), [selectedSlug, groups]
  )

  return (
    <nav {...rest} className={className} >
      <div className='flex flex-col w-full gap-4 h-fit'>
        { 
          groups.map(
            (group, index) => 
            <Link 
                key={index} href={`${group.items[0].route}`} 
                title={group.title}
                alt={group.title}>
              <Header 
                  group={group} 
                  selected={selected_group==index}
                  onClick={()=>onClickMenuItem && onClickMenuItem(group.items[0])} />  
            </Link>

          )
        }
      </div>
      <SideGroup 
          group={groups[selected_group]} 
          onClickMenuItem={onClickMenuItem}
          selectedSlug={selectedSlug} />

    </nav>
  )
}

export default SideBar