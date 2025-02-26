import { sleep } from "@/hooks/sleep";
import { useCallback, useEffect, useState } from "react";

export const RegularLoader = <div className='w-full h-full bg-slate-500/40 animate-pulse rounded-md'/>;


export const LoadingImage = (
  {
    src, className, children=RegularLoader, ...rest
  }: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
) => {
  const [ready, setReady] = useState(false);
  const [extra, setExtra] = useState('opacity-0');
  const onLoad = useCallback(
    async () => {
      await sleep(4000);
      setReady(true);
      requestAnimationFrame(
        () => {
          setExtra('opacity-100')
        }
      )
    }, []
  );
  useEffect(
    () => {
      if(ready) {

      }
    }, [ready]
  );

  return (
    <div className='w-full h-full relative'>
      <div className={'absolute w-full h-full inset-0 transition-all duration-500 ' + (ready ? 'opacity-0' : 'opacity-100')}>
        {
          children
        }
      </div>

      <div className={'w-full h-full absolute inset-0 ' + ' duration-500 transition-all ' + (ready ? 'opacity-100' : 'opacity-0')}>
        <img 
          src={src} {...rest} onLoad={onLoad}
          className={'w-full h-full opacity-40 object-cover rounded-md'}
        />

      </div>

      <div className={'w-full h-full absolute inset-0 ' + ' duration-500 transition-all ' + (ready ? 'opacity-100' : 'opacity-0')}>
        <img 
          src={src} {...rest} onLoad={onLoad}
          className={className}
        />

      </div>

    </div>
  )
}
