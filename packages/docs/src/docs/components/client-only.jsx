import { useEffect, useState } from 'react'

export default function ClientOnly({ children, ...rest }) {
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