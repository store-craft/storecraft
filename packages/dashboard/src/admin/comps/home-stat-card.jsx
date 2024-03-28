import { useEffect, useState } from 'react'
import { MdNavigateNext } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { getShelf } from '../../admin-sdk'
import { Bling } from './common-ui'

const StatCard = ({ colId, msg, link, search=[], Icon }) => {
  const [v, setV] = useState(undefined)
  useEffect(
    () => {
      async function a() {
        const count = await getShelf().stats.countOf(colId, search)
        setV(count)
      }
      a()
    }, []
  )

  return (
<Link to={link} className='cursor-pointer' draggable='false'>
  <Bling stroke='p-0.5' rounded='rounded-lg'
         className='w-fit shadow-md hover:scale-105 
                    transition-transform'>
    <div className='shelf-plain-card-fill shelf-border-color 
                    border rounded-lg max-h-[5rem] 
                    w-fit px-2 py-2 flex flex-col items-left gap-2'>
      <p children={msg} className='text-sm ' />
      <div className='flex flex-row justify-between w-full 
                      items-center shelf-text-label-color'>
        <p children={v} className='text-xl ' />
        <MdNavigateNext className='text-2xl translate-x-2' />
      </div>
    </div>
  </Bling>    
</Link>
  )
}


export default StatCard
