import { useEffect, useState } from 'react'

/**
 * @typedef {object} ClientOnlyParams
 * @prop {React.ReactNode} children
 * 
 * 
 * @param {ClientOnlyParams} params
 * 
 */
export default function ClientOnly(
  { 
    children
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
    <>
      {children}
    </>
  )
}

/**
 * 
 * @param {React.FC} Component 
 * 
 */
export function withClient(Component) {

  /**
   * @param {object} props
   */
  return (props) => {

    const [hasMounted, setHasMounted] = useState(false);

    useEffect(
      () => {
        setHasMounted(true)
      }, []
    );

    if(!hasMounted)
      return null;

    return (
      <Component {...props}/>
    )
  }
}