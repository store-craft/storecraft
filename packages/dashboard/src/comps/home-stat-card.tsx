import { useEffect, useState } from 'react'
import { MdNavigateNext } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { Bling } from './common-ui'
import Statistics from '@storecraft/sdk/src/statistics'
import { useStorecraft } from '@storecraft/sdk-react-hooks'

export type StatCardParams = {
  which_table: Parameters<Statistics["countOf"]>["0"],
  msg: string,
  link: string,
  search?: string, // `VQL` search query
  Icon?: React.ReactElement
}

const StatCard = (
  { 
    which_table, msg, link, search='', Icon 
  }: StatCardParams
) => {

  const { sdk } = useStorecraft();
  const [v, setV] = useState<string | number>('-');

  useEffect(
    () => {
      async function load() {
        let count: string | number = '-';
        try {
          count = await sdk.statistics.countOf(
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
      stroke='border-2' 
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
