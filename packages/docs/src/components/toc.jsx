import { to_handle } from '@/utils/func.utils.js'
import Link from 'next/link.js';
import { usePathname } from 'next/navigation.js'
import { useRouter } from 'next/router.js';
import { useEffect, useMemo, useState } from 'react'

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
          handle: to_handle(it.text)
        }
      )
    )
    , [headings]
  );

      
  return (
  <div {...rest}>
    <div className='px-4 flex flex-col font-medium gap-1.5 text-sm w-full   '>
      <p children='On this page' className='text-kf-600 dark:text-white font-bold text-base mb-2'/>        
      {
        headings_with_handles.map(
          (h, ix) => (
            <Link 
                key={ix}
                href={'#' + h.handle} 
                children={h.text} 
                className={'hover:text-kf-400 ' + (h.handle===hash ? 'text-pink-500' : '')} />
          )
        )
      }
    </div>
  </div>
  )
}

export default TOC
