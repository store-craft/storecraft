import pkg from '../../../package.json'

export const Logo = ({ ...rest }) => {

const Capsule = ({}) => {

  return (
  <div className='rounded-lg my-auto b
                  bg-pink-50 dark:bg-pink-50/10 w-fit text-sm
                  text-pink-500 -tracking-wideset
                  py-0 px-1 --border font-semibold'>
    <div children='docs' className='inline-block -translate-y-px --inline'/>
    <span children=' 📖' />
  </div> 
  )
}

  return (
<div className='relative w-full h-16 flex flex-row 
                items-start 
                border-b
                shelf-logo
                 text-xl font-bold 
                pr-3 overflow-x-clip shadow-md' {...rest}>
                  
    <img src='/main/main3.png' 
        className='h-full object-contain rounded-xl bg-teal-400 
                  scale-90 border-kf-600 --shadow-lg opacity-80' /> 

  <div className='flex flex-col justify-between h-full p-1'>
    <p children='Storecraft' 
      className='w-fit  text-xl 
                text-transparent font-mono --font-mono tracking-wide
                bg-clip-text bg-gradient-to-r from-pink-500 to-kf-500 
                font-normal' />
    <div className='flex flex-row justify-between items-center'>
      <span children={`v${pkg.version}`} 
        className='tracking-wider text-sm font-light font-mono' />
      <a href='docs' >
        <Capsule />
      </a>
  
    </div>              
  </div>                                  
</div>
  )
}