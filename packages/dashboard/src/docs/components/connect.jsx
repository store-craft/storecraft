import { BsDiscord, BsGithub, BsLinkedin } from 'react-icons/bs'

const Connect = ({...rest}) => {

  return (
<div {...rest}>
  <div className='w-full h-10 flex flex-row justify-end items-center
                  text-gray-500 gap-3 py-3 px-4'>
    <a href='https://discord.gg/zd2dvpFr' 
       title='Join our Discord'
       alt='Join our Discord'    
       target='_blank' rel='noopener noreferrer'>
      <BsDiscord className='text-2xl --animate-pulse'/>
    </a>
    <a href='https://github.com/shelf-cms' 
       title='Fork us on Github'
       alt='Fork us on Github'
       target='_blank' rel='noopener noreferrer'>
      <BsGithub className='text-xl'/>
    </a>
    <a href='https://linkedin.com/company/shelf-cms/'
       title='Catch us at Linkedin'
       alt='Catch us at Linkedin'
       target='_blank' rel='noopener noreferrer'>
      <BsLinkedin className='text-xl'/>
    </a>
    
  </div>
</div>    
  )
}