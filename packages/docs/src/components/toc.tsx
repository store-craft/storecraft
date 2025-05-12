import { to_handle } from '@/utils/func.utils'
import { useRouter } from 'next/router.js';
import { useEffect, useMemo, useState } from 'react'
import { MDView } from './md-view';
import Link from 'next/link.js';
import ClientOnly from './client-only';

const strip_tags = (s: string) => {
  let refined = s;

  while(true) {
    const a = refined.indexOf('<');
    const b = refined.indexOf('>');

    if(a==-1 || b==-1) 
      return refined;

    refined = refined.slice(0, a) + ' ' + refined.slice(b + 1);
  }

  return refined;
}

const lvl2pl = [
  'pl-0',
  'pl-2',
  'pl-4',
  'pl-8',
]

export const chop_words = (line='', max=3) => {
  return line.split(' ').slice(0, max).join(' ') + '...'
}

export type TOCParams = {
  className?: string,
  headings?: import('../../pages/docs/[[...slug]].js').PostPageProps["data"]["headings"]
} & React.ComponentProps<'div'>;

export const TOC = (
  { 
    headings, ...rest
  }: TOCParams
) => {

  const { asPath } = useRouter();
  const [hash, setHash] = useState('');
  
  useEffect(
    () => {
      setHash(window.location.hash?.slice(1));
    }, [asPath]
  );

  const headings_with_handles = useMemo(
    () => headings?.map(
      it => (
        { 
          ...it, 
          handle: to_handle(strip_tags(it.text))
        }
      )
    )
    , [headings]
  );

  return (
  <div {...rest} >
    <div 
      className='px-4 flex flex-col font-semibold antialiased gap-5 
        overflow-y-scroll overflow-x-clip text-sm w-full h-fit max-h-full border-l 
        border-gray-400/10 pb-10'>
      <div 
        children='On this page' 
        className='text-kf-600 dark:text-white font-semibold
          prose prose-slate --font-bold text-base/8 mb-2'/>        

      {
        headings_with_handles?.slice(1).map(
          (h, ix) => (
            <Link 
              key={ix}
              href={'#' + h.handle} 
              className={
                `opacity-80 font-normal text-ellipsis 
                --dark:hover:text-white hover:text-pink-400 
                --${lvl2pl[h.level-1]} ` 
                + (h.handle===hash ? 'text-pink-400 ' : '')
              }>
              <ClientOnly>
                <MDView 
                  value={
                    (h.text.toLowerCase() ?? chop_words(h.text, 10))
                  } 
                  className='capitalize' 
                />
              </ClientOnly>
            </Link>
          )
        )
      }
    </div>
  </div>
  )
}

export default TOC
