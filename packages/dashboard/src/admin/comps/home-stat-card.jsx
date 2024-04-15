import { useEffect, useState } from 'react'
import { MdNavigateNext } from 'react-icons/md/index.js'
import { Link } from 'react-router-dom'
import { getSDK } from '@storecraft/sdk'
import { Bling } from './common-ui.jsx'
import Statistics from '@storecraft/sdk/src/statistics.js'

/**
 * 
 * @typedef {object} StatCardParams
 * @prop {Parameters<Statistics["countOf"]>["0"]} which_table
 * @prop {string} msg
 * @prop {string} link
 * @prop {string} [search] `VQL` search query
 * @prop {React.ReactElement} [Icon]
 * 
 * @param {StatCardParams} params
 * 
 */
const StatCard = (
  { 
    which_table, msg, link, search='', Icon 
  }
) => {

  const [v, setV] = useState('-');

  useEffect(
    () => {
      async function load() {
        let count = '-';
        try {
          count = await getSDK().statistics.countOf(
            which_table,
            {
              vql: search
            }
          );
        } catch (e) {
        }

        setV(count);
      }

      load();
    }, [which_table, search]
  );

  return (
<Link 
    to={link} 
    className='cursor-pointer' 
    draggable='false'>
  <Bling 
      stroke='p-0.5' 
      rounded='rounded-lg'
      className='w-fit shadow-md hover:scale-105 
                transition-transform'>
    <div className='shelf-plain-card-fill shelf-border-color 
                    border rounded-lg max-h-[5rem] 
                    w-fit px-2 py-2 flex flex-col items-left gap-2'>
      <p children={msg} className='text-sm ' />
      <div className='flex flex-row justify-between w-full 
                      items-center shelf-text-label-color'>
        {
          v && <p children={v} className='text-xl ' />
        }                        
        <MdNavigateNext className='text-2xl translate-x-2' />
      </div>
    </div>
  </Bling>    
</Link>
  )
}

export default StatCard
