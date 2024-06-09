import Link from 'next/link.js'
import { MDXRemote } from 'next-mdx-remote'
import { GrInstall, GrArticle } from 'react-icons/gr/index.js'
import { BsNewspaper } from 'react-icons/bs/index.js'
import { BiLogoFirebase } from 'react-icons/bi/index.js'
import { TbBrandFirebase } from 'react-icons/tb/index.js'
import { MdOutlineSchema } from 'react-icons/md/index.js'
import { AiOutlineDatabase } from 'react-icons/ai/index.js'
import { MdAdminPanelSettings } from 'react-icons/md/index.js'
import { DiStackoverflow } from 'react-icons/di/index.js'
import { FaServer } from 'react-icons/fa/index.js'
import { IconContext } from "react-icons";

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

const Header = ({ group }) => {
  const {title, items, icon} = group

  return (
<div className='flex flex-row items-center gap-2 px-2
                text-kf-500 dark:text-pink-500'>
  <div className='border p-1 border-kf-500/20 dark:border-pink-500/40 rounded-md'>
    <Icon {...icon} />
  </div>                
  <div 
    className='text-xs font-old2 opacity-95 font-semibold 
             w-full tracking-wide '
    children={title.toUpperCase()} />

</div>    
  )
}

const SideGroup = 
  ({ onClickMenuItem, selectedSlug, group, ...rest }) => {

  const {title, items, icon} = group

  return (
    <div {...rest}>

      <Header group={group} />
      <div className='flex flex-col w-full gap-2 mt-3'>
        { 
          items.map(
            (item, index) => 
              <Link key={index} href={`${item.route}`} >
                <p onClick={e => { onClickMenuItem && onClickMenuItem(item)}} 
                   className={`text-sm  font-medium px-2 
                               py-1 rounded-md
                              ${item.route===selectedSlug ? 
                                `bg-kf-50 dark:bg-kf-500 
                                  text-kf-700 
                                 dark:text-gray-100` : 
                                'bg-transparent text-gray-600 dark:text-gray-300'
                              }`}
                   children={item.title} />
              </Link>
          )
        }
      </div>

    </div>
  )
}

const SideBar = 
  ({ className, onClickMenuItem, selectedSlug, groups, 
     name, ...rest }) => {

  return (
    <nav {...rest} className={className} >
      <div className='flex flex-col w-full gap-6 h-fit pb-10'>
        { 
          groups.map(
            (group, index) => 
              <SideGroup className='' key={index} 
                        group={group} 
                        selectedSlug={selectedSlug}
                        onClickMenuItem={onClickMenuItem} />  
          )
        }
      </div>
    </nav>
  )
}

export default SideBar