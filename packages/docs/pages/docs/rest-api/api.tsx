import useDarkMode from '@/hooks/use-dark-mode'
import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  type createApiReference, 
} from '@scalar/api-reference'
import useTrigger from '@/hooks/use-trigger';
import Script from 'next/script';

export default function RestApiReference() {
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const trigger = useTrigger();
  const ref_loaded_scalar = useRef(false);

  useEffect(
    () => {
      async function load() {
        if(ref_loaded_scalar.current)
          return;
        
        if(!('Scalar' in window)) {
          console.error('Scalar not found in window');
          return;
        }
        const Scalar = window.Scalar as {createApiReference: typeof createApiReference};
  
        ref_loaded_scalar.current = true;

        console.log(window.Scalar)
  
        Scalar.createApiReference(
          '#scalar_reference',
          {
            url: 'https://unpkg.com/@storecraft/core@latest/rest/openapi.json',
            theme: 'default',
            darkMode: darkMode,
          }
        );
  
        console.log('mounted scalar reference');
  
        setLoading(false);
      }

      load();
      
    },
  );

  const onLoad = useCallback(
    async () => {
      trigger();
      console.log('loaded scalar script');
    }, []
  )

  return (
    <div className='w-full h-screen bg-black'>
      <div id="scalar_reference"></div>
      <Script 
        src="https://cdn.jsdelivr.net/npm/@scalar/api-reference" 
        onLoad={onLoad}
      />
      {
        loading && (
          <div className="flex justify-center items-center h-screen">
            <div className="">Loading API</div>
          </div>
        )
      }
    </div>
  )
}
