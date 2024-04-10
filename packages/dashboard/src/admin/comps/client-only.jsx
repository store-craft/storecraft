import { useEffect, useState } from 'react'

/**
 * 
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>} params 
 */
export default function ClientOnly(
  { 
    ...rest 
  }
) {

  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setHasMounted(true)
  }, []);
  if (!hasMounted) {
    return null;
  }
  return (
    <div {...rest}/>
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