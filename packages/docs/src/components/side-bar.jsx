import Link from 'next/link.js'
import { BsNewspaper } from 'react-icons/bs/index.js'
import { AiOutlineDatabase } from 'react-icons/ai/index.js'
import { MdAdminPanelSettings } from 'react-icons/md/index.js'
import { DiStackoverflow } from 'react-icons/di/index.js'
import { FaServer } from 'react-icons/fa/index.js'
import { useCallback, useMemo, useState } from 'react'
import { IoMdClose } from "react-icons/io/index.js";
import Drawer from './drawer.jsx'

/**
 * 
 * @typedef {object} Group
 * @property {string} [route]
 * @property {string} [path]
 * @property {string} [empty=false]
 * @property {string} [title]
 * @property {object} [icon]
 * @property {string} [icon.name]
 * @property {object} [icon.params]
 * @property {Group[]} [groups]
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

  const {title, groups, icon} = group;

  const clsSelected = ` border-white/80 dark:border-white/10 
                       bg-gradient-to-br 
                       from-kf-500 to-pink-500/20 
                       dark:to-kf-500/20 dark:from-pink-500 
                       text-white dark:text-white/70 `;
  const clsHover = ` group-hover:border-white/80 group-hover:dark:border-white/10 
                       group-hover:bg-gradient-to-br 
                       group-hover:from-kf-500 group-hover:to-pink-500/20 
                       group-hover:dark:to-kf-500/20 group-hover:dark:from-pink-500 
                       group-hover:text-white group-hover:dark:text-white/70 `;
  const clsUnSelected = 'text-kf-400 border-kf-500/20 group-hover:dark:border-pink-500/40';

  return (
<div {...rest}>    
  <div className={'group flex flex-row items-center gap-2 px-2 cursor-pointer ' }>
    <div className={`text-base p-1 dark:text-slate-300 
                   rounded-md border group-hover:text-green-500
                  ${selected ? clsSelected : clsUnSelected}
                  ${clsHover}
                  `
                  }>
      <Icon {...icon} />
    </div>                
    <div 
      className={`--text-xs opacity-95 font-semibold 
              w-full tracking-wide ${selected ? 'text-kf-700 dark:text-pink-500' : ''}`}
      children={title.toUpperCase()} />

  </div>    
</div>    
  )
}

/**
 * @typedef {object} Link2Params
 * @prop {string} title
 * @prop {boolean} next
 * @prop {string} [itemClass]
 * @prop {boolean} [selected=false]
 * 
 * @param {Link2Params & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
 * } params
 */
const Link2 = (
  { 
    title, selected=false, next=false, itemClass, ...rest 
  }
) => {

  return (
<div {...rest}>
<div className={
  'flex flex-row items-center gap-0 w-full ' + 
  itemClass + 
  ' text-sm font-medium px-2 py-1 rounded-md ' +
   (selected ? ' bg-kf-50 dark:bg-kf-500 text-kf-700 dark:text-gray-100' : 
      ' dark:hover:bg-kf-500/20 hover:bg-kf-50')
    }>
  <p children={title} />
  { next && <MdNavigateNext /> }
</div>    
</div>    
  )
}

import { MdNavigateNext } from "react-icons/md/index.js";

/**
 * @typedef {object} SideGroupsParams
 * @prop {Group} group
 * @prop {string} selectedSlug
 * @prop {string} [itemClass]
 * @prop {(item: Group) => any } onClickMenuItem
 * 
 * 
 * @param {SideGroupParams &
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
const SideGroups = (
  { 
    onClickMenuItem, selectedSlug, group, itemClass, ...rest 
  }
) => {

  const {title, groups, icon} = group;

  return (
    <div {...rest}>
      <div className='flex flex-col w-full gap-2'>
        { 
          groups.map(
            (item, ix) => (
              <SideGroup
                key={ix}
                onClickMenuItem={onClickMenuItem}
                group={item}
                itemClass={itemClass}
                selectedSlug={selectedSlug}
                />
            )
          )
        }
      </div>

    </div>
  )
}

/**
 * @typedef {object} SideGroupParams
 * @prop {Group} group
 * @prop {string} selectedSlug
 * @prop {string} [itemClass]
 * @prop {(item: Group) => any } onClickMenuItem
 * 
 * 
 * @param {SideGroupParams &
*  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
* } params
* 
*/
const SideGroup = (
 { 
   onClickMenuItem, selectedSlug, group, itemClass, ...rest 
 }
) => {


const isLeaf = !group.groups?.length;
const [open, setopen] = useState(
  selectedSlug.startsWith(group.route)
);

// console.log(selectedSlug)
// console.log(group.route)
// console.log(selectedSlug.startsWith(group.route))

const _onClick = useCallback(
  (_) => {
    setopen(v=>!v);

    onClickMenuItem && onClickMenuItem(group);
  }, [onClickMenuItem, group]
);

  return (
    <Link 
        href={`${group.empty ? group?.groups[0].route : group.route }`} 
        alt={group.title}
        title={group.title}>
      <Link2 
          itemClass={itemClass}
          onClick={_onClick} 
          selected={isLeaf && group.route===selectedSlug}
          title={group.title} 
          next={!isLeaf}/>
      {
        !isLeaf &&
        <Drawer button={null} isOpen={open} className={open ? 'mt-2' : ''}>
          <SideGroups 
              itemClass={'pl-5'}
              group={group} 
              onClickMenuItem={onClickMenuItem} 
              selectedSlug={selectedSlug} />
        </Drawer>
      }
    </Link>
  )
}


/**
 * @typedef {object} SideBarParams
 * @prop {Group[]} groups
 * @prop {string} selectedSlug
 * @prop {(item: Group) => any } [onClickMenuItem]
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
        return g.groups.find(
          it => selectedSlug.startsWith(it.route ?? it.groups[0].route)
        )!==undefined
      }
    ), [selectedSlug, groups]
  );

  // console.log(
  //   'selected_group', selected_group
  // );

  return (
    <nav {...rest} className={className} >
      <div className='flex flex-col w-full gap-4 h-fit'>
        { 
          groups.map(
            (group, index) => 
            <Link 
                key={index} 
                href={`${group.groups[0].empty ? group?.groups[0].groups[0].route : group.groups[0].route}`} 
                title={group.title}
                alt={group.title}>
              <Header 
                  group={group} 
                  selected={selected_group==index}
                  onClick={()=>onClickMenuItem && onClickMenuItem(group.groups[0])} />  
            </Link>

          )
        }
      </div>
      <SideGroups 
          className='mt-10'
          group={groups[selected_group]} 
          onClickMenuItem={onClickMenuItem}
          selectedSlug={selectedSlug} />

    </nav>
  )
}


/**
 * 
 * @typedef {object} SideBarSmallParams
 * @prop {boolean} [showMenu=false]
 * @prop {Group[]} groups
 * @prop {string} selectedSlug
 * @prop {(item: Group) => any } [onClickMenuItem]
 * 
 * @param {SideBarSmallParams & 
*  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
* } params
*/
export const SideBarSmall = (
 {
   showMenu=false, selectedSlug, groups, onClickMenuItem, ...rest
 }
) => {

 return (
   <>
     <div 
         className={`z-[50] block md:hidden w-[300px] h-full absolute 
                     transition-transform duration-300
                     ${showMenu ? 'translate-x-0' : '-translate-x-[300px]'}`
                   }>
       <SideBar 
           className={`absolute left-0 p-6 w-full 
                       h-full overflow-y-auto  text-sm
                       bg-white dark:bg-gray-900
                       `
                     }
           onClickMenuItem={onClickMenuItem}
           selectedSlug={selectedSlug}
           groups={groups} 
       />

       {
         showMenu && 
         <IoMdClose 
             className='absolute right-5 top-5 z-[55] text-xl' 
             onClick={_ => onClickMenuItem(undefined)} />
       }
     </div>

     <div 
       onClick={_ => onClickMenuItem(undefined)}
       className={
         `
         absolute w-full h-full top-0 left-0 z-40 cursor-pointer block md:hidden
         ${showMenu ? 'block bg-black/30 dark:bg-gray-900/30 backdrop-blur-sm' : 'hidden'}
         `
       }/>    
   </>
 )
}


export default SideBar