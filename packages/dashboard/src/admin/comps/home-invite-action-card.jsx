import { MdNavigateNext } from 'react-icons/md/index.js'
import { Link } from 'react-router-dom'
import { Bling } from './common-ui.jsx'


/**
 * 
 * @typedef {object} InviteActionCardParams
 * @prop {string} [msg='']
 * @prop {string} [link='/admin']
 * @prop {React.ReactElement} Icon
 * 
 * @param {InviteActionCardParams} params
 * 
 */
const InviteActionCard = (
  { 
    msg='', link='/admin', Icon
  }
) => {
  
  return (
<Link to={link} className='cursor-pointer'
      draggable='false'>
  <Bling className='w-fit shadow-md hover:scale-105 transition-transform'
        rounded='rounded-lg' >
    <div className='shelf-plain-card-fill shelf-border-color
                    border 
                    rounded-lg max-h-[5rem] 
                      w-fit px-5 py-5 flex flex-row items-center gap-2'>
      { Icon }
      <p children={msg} className='text-lg ' />
      <MdNavigateNext className='text-3xl text-kf-400' />
    </div>
  </Bling>    
</Link>
  )
}

export default InviteActionCard
