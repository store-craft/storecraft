

/**
 * 
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } props 
 */
const LoginCopyright = (props) => {
  return (
    <div {...props}>
      <p className='w-full py-4 text-sm font-semibold text-center 
                text-gray-400 dark:text-white' >
        { `all rights reserved, storecraft (${new Date().getFullYear()})` }
      </p>
    </div>  
  )
}

export default LoginCopyright;

