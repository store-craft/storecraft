import React, { useEffect, useState } from "react";
import { IoCloseSharp } from 'react-icons/io5'
import pkg from '@storecraft/core/package.json';
import { useStorecraft } from "@storecraft/sdk-react-hooks";

const useMarquee = () => {

  const [messages, setMessages] = useState<string[]>([]);
  const { sdk } = useStorecraft();

  useEffect(
    () => {
      async function get_backend_version() {
        try {
          const info = await sdk.reference.info();
          // return undefined;
          return info.core_version;
        } catch (e) {
          return undefined;
        }
      }

      async function get_latest_version(): Promise<string | undefined> {
        try {
          const res = await fetch(
            'https://registry.npmjs.org/@storecraft/core/latest'
          );
          if(!res.ok) {
            throw new Error('Failed to fetch latest version');
          }
          const json = await res.json();
          return json?.version;
        } catch (e) {
          return undefined;
        }
      }

      async function get_dashboard_version() {
        return Promise.resolve(pkg.version);
      }

      async function compute_messages() {
        const [backend, latest, dashboard] = await Promise.all([
          get_backend_version(),
          get_latest_version(),
          get_dashboard_version()
        ]);

        const messages: string[] = [];

        // dashboard version always available and defined
        // backend version might be undefined because the `/info` endpoint is newer
        // latest version might be undefined because of network error

        console.log({dashboard, backend, latest});
        if (dashboard !== backend) {
          messages.push(`⚠️ Dashboard version ${dashboard} might be 
            incompatible with your backend version ${backend ?? ''}`);
        }

        if (latest && backend !== latest) {
          messages.push(`👉 New version available: ${latest}`);
        }

        setMessages(messages);
      }
      compute_messages();

    }, []
  );

  return {
    messages
  }
}

export const Marquee = (
  {
    ...rest
  } : React.ComponentProps<'div'>
) => {
  const [open, setOpen] = useState(true);
  const { messages } = useMarquee();

  if(!open)
    return null;

  if(messages.length === 0)
    return null;

  return (
    <div {...rest}>
      <div className='w-full h-full flex items-center 
        justify-center text-base relative
        bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/100'>
        <span 
          children={messages.join(' ')}
          className='whitespace-nowrap text-gray-600 dark:text-white 
            font-mono text-sm font-bold'/>
        <IoCloseSharp 
          className='absolute right-3 text-black cursor-pointer'
          onClick={() => setOpen(false)}/>
      </div>
    </div>
  )
}