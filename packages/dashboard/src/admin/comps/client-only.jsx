import {useEffect, useState} from 'react'

/**
 * 
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>} param0 
 * @returns 
 */
export default function ClientOnly({ children, ...rest }) {
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setHasMounted(true)
  }, []);
  if (!hasMounted) {
    return null;
  }
  return (
    <div {...rest}>
      {children}
    </div>
  )
}

/**
 * 
 * @param {import('react').FC} Component 
 */
export function withClient(Component) {

  return (props) => {

    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
      setHasMounted(true)
    }, [])

    if (!hasMounted)
      return null

    return (
      <Component {...props}/>
    )
  }
}