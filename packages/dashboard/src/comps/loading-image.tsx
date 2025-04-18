import { useStorecraft } from "@storecraft/sdk-react-hooks";
import { useCallback, useEffect, useState } from "react";

export const RegularLoader = () => (
  <div 
    className='w-full h-full bg-slate-500/40 animate-pulse rounded-md'
  />
);


export const LoadingImage = (
  {
    src, children=RegularLoader(), ...rest
  }: React.ComponentProps<'img'>
) => {
  const [ready, setReady] = useState(false);
  const [extra, setExtra] = useState('opacity-0');
  const [source, setSource] = useState<string>(undefined);
  const { sdk } = useStorecraft();

  const onLoad = useCallback(
    async (e) => {
      // await sleep(4000);
      if ('naturalHeight' in e) {
        if (e.naturalHeight + e.naturalWidth === 0) {
          return;
        }
      }
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
      // figure out if this a url or storage path
      sdk.storage.getSource(src, true).then(setSource);
    }, [src]
  );

  return (
    <div {...rest}>
      <div className='w-full h-full relative cursor-pointer' >
        <div className={'absolute w-full h-full inset-0 transition-all duration-500 ' + (ready ? 'opacity-0' : 'opacity-100')}>
          {
            children
          }
        </div>
        {
          source && (
          <>
            <div className={'w-full h-full absolute inset-0 ' + ' duration-500 transition-all ' + (ready ? 'opacity-100' : 'opacity-0')}>
              <img 
                src={source} {...rest} onLoad={onLoad}
                className={'w-full h-full opacity-40 object-cover rounded-md'}
              />
            </div>

            <div className={'w-full h-full absolute inset-0 ' + ' duration-500 transition-all ' + (ready ? 'opacity-100' : 'opacity-0')}>
              <img 
                src={source} {...rest} 
                onLoad={onLoad}
                className={'w-full h-full object-contain p-2'}
              />
            </div>
          </>
          )
        }

      </div>
    </div>
  )
}


export const LoadingSingleImage = (
  {
    src, children, ...rest
  }: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
) => {
  const [ready, setReady] = useState(false);
  const [extra, setExtra] = useState('opacity-0');
  const [source, setSource] = useState<string>(null);
  const { sdk } = useStorecraft();
  const onLoad = useCallback(
    async (e) => {
      // await sleep(4000);
      if ('naturalHeight' in e) {
        if (e.naturalHeight + e.naturalWidth === 0) {
          return;
        }
      }
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
      sdk.storage.getSource(src, true).then(setSource);
    }, [src]
  );

  return (
    <div {...rest}>
      <div className='w-full h-full relative'>
        <div className='absolute w-full h-full left-0 top-0 
            bg-slate-500/40 animate-pulse rounded-md'/>
        <img src={source} className='absolute w-full h-full left-0 top-0 my-0
            rounded-md object-cover --blur-xs opacity-20'/>
        <img src={source} className='absolute w-full h-full left-0 top-0 my-0
            rounded-md object-contain p-2'/>
      </div>

    </div>
  )
}
