import { to_handle } from '@/utils/func.utils.js'
import Link from 'next/link.js';
import { useRouter } from 'next/router.js';
import { useEffect, useMemo, useState } from 'react'
import { MDView } from './md-view.jsx';

/**
 * 
 * @param {string} s 
 */
const strip_tags = s => {
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
  'pl-4',
  'pl-8',
  'pl-16',
]

/**
 * @typedef {object} TOCParams
 * @prop {string} [className]
 * @prop {import('../../pages/[[...slug]].js').PostPageProps["data"]["headings"]} [headings]
 * 
 * @param {TOCParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
export const TOC = (
  { 
    headings, ...rest
  }
) => {

  const { asPath } = useRouter();
  const [hash, setHash] = useState('');
  
  useEffect(
    () => {
      setHash(window.location.hash?.slice(1));
    }, [asPath]
  );

  const headings_with_handles = useMemo(
    () => headings.map(
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
    <div className='px-4 flex flex-col font-medium gap-1.5 text-sm w-full   '>
      <div 
          children='On this page' 
          className='text-kf-600 dark:text-white 
                prose prose-slate font-bold text-base mb-2'/>        

      {
        headings_with_handles.map(
          (h, ix) => (
            <Link 
                key={ix}
                href={'#' + h.handle} 
                cchildren={(h.level>1 ? '' : '') + h.text} 
                ddangerouslySetInnerHTML={ {__html: (h.level>1 ? '' : '') + h.text}} 
                
                className={
                  `hover:text-kf-400 ${lvl2pl[h.level-1]} ` + (h.handle===hash ? 'text-pink-500' : '')
                }>
                <MDView value={(h.level>1 ? '' : '') + h.text} />
              </Link>
          )
        )
      }
    </div>
  </div>
  )
}

export default TOC
