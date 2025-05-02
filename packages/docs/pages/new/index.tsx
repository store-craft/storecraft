import { GradStroke, GradStrokeV2 } from '@/components/grad-stroke';
import Header from '@/components/header';
import useDarkMode from '@/hooks/use-dark-mode';
import docs from '@/utils/docs-config'
import { SideBarSmall } from '@/components/side-bar';
import useToggle from '@/hooks/use-toggle';
import { Hero } from '@/components/landing-hero';
import { LandingCards } from '@/components/landing-cards';
import { CodeBlock } from '@/components/code-block';
import { code, code_payment, NPX } from '@/components/landing-more';
import { Segment } from '@/components/landing-segment';
import { Bling } from '@/components/common';
import { CommonGradientText } from '@/components/gradient-text';
import { IoTerminal } from "react-icons/io5";
import ClientOnly from '@/components/client-only';
import sdk from '@stackblitz/sdk';
import { useEffect } from 'react';


export default () => {
  const { darkMode, toggle } = useDarkMode()
  const [menu, toggleMenu] = useToggle(false);

  useEffect(
    () => {
      const iframe = document.getElementById('embed') as HTMLIFrameElement;
      if (iframe) {
        sdk.embedGithubProject(
          'embed', 
          'store-craft/storecraft/tree/main/packages/playground/node-sqlite', {
          height: '50%',
          width: '50%',
          view: 'preview',
          openFile: 'app.js',
          forceEmbedLayout: true,
        });
      }
    }, []
  );

  return (
    <div className={'w-screen h-screen relative ' + (darkMode ? 'dark' : '')}>
      <iframe id='embed' className='w-full h-full' />
    </div>
  )
};
