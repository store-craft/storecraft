import { useRouter } from 'next/navigation.js'
import { useEffect } from 'react'

export default () => {
  const router = useRouter()
  useEffect(
    () => {
      // router.replace('dashboard');
    }, [router]
  );
  return 'tomer';
};
