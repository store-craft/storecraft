import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default () => {
  const router = useRouter()
  useEffect(
    () => {
      router.replace('admin');
    }, [router]
  );
  return null;
};
