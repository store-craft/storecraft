import { useCallback, useEffect, useMemo, useState } from 'react'
import { BlingInput, HR } from './common-ui.jsx'
import { useStorecraft } from '@storecraft/sdk-react-hooks'
import { Editor } from "@monaco-editor/react";
import Handlebars from 'handlebars';
import useDarkMode from '../hooks/useDarkMode.js';
import { BsLayoutSplit } from "react-icons/bs/index.js";
import { RiLayoutRowLine } from "react-icons/ri/index.js";
import { VscLayoutSidebarLeftOff } from "react-icons/vsc/index.js";
import { CgArrowsExpandRight } from "react-icons/cg/index.js";
import { IoIosExpand } from "react-icons/io/index.js";
import { FaRegWindowClose } from "react-icons/fa/index.js";


/**
 * 
 * @param {object} params
 * @param {(value: 0 | 1 | 2) => void} params.onChange
 * @param {0 | 1 | 2} [params.mode=0]
 */
const LayoutSwitch = (
  { 
    mode=0, onChange 
  }
) => {


  const layout_onChange = useCallback(
    /** @param {0 | 1 | 2} ix */
    (ix) => {
      onChange && onChange(ix);
    }, [onChange]
  );

  return (
    <div className='flex flex-row gap-3 items-center p-2 
                    rounded-md border w-fit shelf-border-color
                    relative text-base'>
      {/* <div className='h-full w-1/3 bg-red-100 absolute' />                       */}
      <VscLayoutSidebarLeftOff 
          className={'--text-xl cursor-pointer z-10 ' + (mode==0 ? 'scale-150' : '')}
          onClick={() => layout_onChange(0)} />
      <VscLayoutSidebarLeftOff 
          className={'--text-lg cursor-pointer rotate-90 z-10 ' + (mode==1 ? 'scale-150' : '')}
          onClick={() => layout_onChange(1)} />
      <IoIosExpand 
          className={'cursor-pointer z-10 ' + (mode==2 ? 'scale-150' : '')}
          onClick={() => layout_onChange(2)} />
    </div>
  )
}


/**
 * 
 * @typedef {object} DangerousHTMLViewParams
 * @prop {string | TrustedHTML} [value]
 * 
 * 
 * @param {DangerousHTMLViewParams &
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 */
const DangerousHTMLView = (
  {
    value, ...rest
  }
) => {

  return (
    <div {...rest}>
      <div dangerouslySetInnerHTML={{__html: value}}/>            
    </div>
  )
}


/**
 * @typedef {import('./fields-view.jsx').FieldLeafViewParams<
 *   import('@storecraft/core/v-api').TemplateType["template"]> 
 * } TemplateTemplateParams
 * 
 * @param {TemplateTemplateParams & 
 *  Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'onChange'
 * >} param
 */
export const TemplateTemplate = (
  { 
    field, context, setError, value, onChange, ...rest 
  }
) => {

  /** @type {ReturnType<typeof useState<0 | 1 | 2>>} */
  const [mode, setMode] = useState(0);
  const [template, setTemplate] = useState(value);
  const { darkMode } = useDarkMode();
  /** @type {Parameters<Editor>["0"]["onChange"]} */
  const editor_onChange = useCallback(
    (value) => {
      setTemplate(value);
      onChange(value);
    }, [onChange]
  );

  /** @type {Parameters<LayoutSwitch>["0"]["onChange"]} */
  const layout_onChange = useCallback(
    (value) => {
      setMode(value);
    }, []
  );

  const html = useMemo(
    () => {
      const handlebarsTemplate = Handlebars.compile(template);
      const parsedHtml = handlebarsTemplate({});

      return parsedHtml;
    }, [template]
  );

  useEffect(
    () => {
      const listener = (e) => {
        console.log(e)
        if((mode==2) && (e.key==='Escape')) {
          setMode(0);
        }
      };

      document.addEventListener(
        'keydown', listener
      );

      return () => { document.removeEventListener('keydown', listener) }
    }, [mode]
  );

  return (
<div {...rest} >
  <div className='flex flex-col w-full gap-5'>
    <LayoutSwitch 
        onChange={layout_onChange} 
        mode={mode}
         />
    
    { mode<2 &&
      <div className='w-full flex flex-col gap-5 relative'>
        <Editor
            width='100%'
            height="500px"
            className='rounded-md border shelf-border-color overflow-clip'
            onChange={editor_onChange}
            value={template}
            theme={darkMode ? 'vs-dark' : 'light'}
            // theme='vs-dark'
            defaultLanguage='handlebars'
            // defaultValue="// some comment"
            // onMount={handleEditorDidMount}
          />
        <iframe 
            srcDoc={html} 
            className={
              `${mode==0 ? 'absolute translate-x-10 left-full top-0 w-full ' : ''} 
              rounded-md border resize overflow-auto`
            }
            height="500px" />
      </div>
    }
    {
      mode==2 &&
      <div className='z-[100] fixed left-0 top-0 
              flex flex-row gap-0 w-screen h-screen'>
        <Editor
            width='50%'
            height="100%"
            className='rounded-md border shelf-border-color overflow-clip'
            onChange={editor_onChange}
            value={template}
            theme={darkMode ? 'vs-dark' : 'light'}
            // theme='vs-dark'
            defaultLanguage='handlebars'
            // defaultValue="// some comment"
            // onMount={handleEditorDidMount}
          />
        <div className='w-1/2 h-full flex flex-col items-center'>  
          <div className='flex flex-row items-center text-2xl 
                        shelf-plain-card-soft justify-between w-full p-3'>
            <span children='Preview' />
            <FaRegWindowClose onClick={() => setMode(0)} className='cursor-pointer'/>
          </div>
          <iframe 
              srcDoc={html} 
              className={
                `w-full border resize overflow-auto`
              }
              height="100%" />
        </div>  
      </div>
    }
  </div>

</div>
  )
}

export default TemplateTemplate