import { useCallback, useMemo, useState } from 'react'
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


/**
 * 
 * @param {object} params
 * @param {(value: 0 | 1 | 2) => void} params.onChange
 * @param {0 | 1 | 2} [params.defaultValue=0]
 */
const LayoutSwitch = (
  { 
    defaultValue=0, onChange 
  }
) => {

  const [idx, setIdx] = useState(defaultValue);
  const layout_onChange = useCallback(
    (ix) => {
      setIdx(ix);
      onChange && onChange(ix);
    }, [onChange]
  );

  return (
    <div className='flex flex-row gap-3 items-center p-2 
                    rounded-md border w-fit shelf-border-color
                    relative text-base'>
      {/* <div className='h-full w-1/3 bg-red-100 absolute' />                       */}
      <VscLayoutSidebarLeftOff 
          className={'--text-xl cursor-pointer z-10 ' + (idx==0 ? 'scale-150' : '')}
          onClick={() => layout_onChange(0)} />
      <VscLayoutSidebarLeftOff 
          className={'--text-lg cursor-pointer rotate-90 z-10 ' + (idx==1 ? 'scale-150' : '')}
          onClick={() => layout_onChange(1)} />
      <IoIosExpand 
          className={'cursor-pointer z-10 ' + (idx==2 ? 'scale-150' : '')}
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

  return (
<div {...rest} >
  <div className='flex flex-col w-full gap-5'>
    <LayoutSwitch 
        onChange={layout_onChange} 
        defaultValue={mode} />
    <div className='w-full flex flex-col gap-5 relative'>
      <Editor
          width='100%'
          height="500px"
          className='rounded-md border shelf-border-color overflow-clip'
          onChange={editor_onChange}
          value={template}
          theme={darkMode ? 'vs-dark' : 'light'}
          // theme='vs-dark'
          defaultLanguage="handlebars"
          // defaultValue="// some comment"
          // onMount={handleEditorDidMount}
        />
      <iframe 
          srcDoc={html} 
          className={
            `${mode==0 ? 'absolute translate-x-10 left-full top-0 w-full ' : ''} 
            rounded-md border resize overflow-auto`
          }
          cwidth='500px' height="500px" />
      
    </div>
  </div>

</div>
  )
}

export default TemplateTemplate