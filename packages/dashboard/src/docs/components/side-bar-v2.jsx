import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote'
import { GrInstall, GrArticle } from 'react-icons/gr'
import { BsNewspaper } from 'react-icons/bs'
import { BiLogoFirebase } from 'react-icons/bi'
import { TbBrandFirebase } from 'react-icons/tb'
import { MdOutlineSchema } from 'react-icons/md'
import { AiOutlineDatabase } from 'react-icons/ai'
import { MdAdminPanelSettings } from 'react-icons/md'
import { DiStackoverflow } from 'react-icons/di'
import { FaServer } from 'react-icons/fa'
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


const Icon = ({ name, ...rest }) => {

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
 * @param {object} param0 
 * @param {Group} param0.group
 * @param {boolean} param0.selected
 */
const Header = ({ group, selected=false, ...rest }) => {
  const {title, items, icon} = group

  return (
<div {...rest}>    
  <div className='flex flex-row items-center gap-2 px-2 cursor-pointer
                  '>
    <div className='border p-1 text-kf-500 dark:text-pink-500 
                  border-kf-500/20 dark:border-pink-500/40 
                  rounded-md'>
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

const Link2 = ({ title, selected=false, ...rest }) => {

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
 * @param {object} param0 
 * @param {Group} param0.group
 * @param {string} param0.selectedSlug
 * @param {(item: Item) => any } param0.onClickMenuItem
 */
const SideGroup = 
  ({ onClickMenuItem, selectedSlug, group, ...rest }) => {

  const {title, items, icon} = group

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
 * @param {object} param0 
 * @param {Group[]} param0.groups
 * @param {string} param0.selectedSlug
 * @param {(item: Item) => any } param0.onClickMenuItem
 */
const SideBar = 
  ({ className, onClickMenuItem, selectedSlug, groups=[], 
     name, ...rest }) => {

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
            <Link key={index} href={`${group.items[0].route}`} 
                  title={group.title}
                  alt={group.title}>
              <Header group={group} 
                      selected={selected_group==index}
                      onClick={()=>onClickMenuItem && onClickMenuItem(group.items[0])} />  
            </Link>

          )
        }
      </div>
      <SideGroup group={groups[selected_group]} 
                 onClickMenuItem={onClickMenuItem}
                 selectedSlug={selectedSlug} />

    </nav>
  )
}

export default SideBar