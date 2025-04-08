import React, { useEffect, useState } from 'react'

export default function ClientOnly(
  { 
    ...rest 
  }: React.ComponentProps<'div'>
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

export function withClient(Component: React.FC) {

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