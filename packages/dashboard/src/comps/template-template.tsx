import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Editor, EditorProps, useMonaco} from "@monaco-editor/react";
import { Minibars } from '@storecraft/core/mailer/minibars.js'
import useDarkMode from '@/hooks/use-dark-mode'
import { VscLayoutSidebarLeftOff } from "react-icons/vsc";
import { IoIosExpand } from "react-icons/io";
import { FaRegWindowClose } from "react-icons/fa";
import { Splitter } from './splitter-view';
import { FieldLeafViewParams } from './fields-view';
import { TemplateType } from '@storecraft/core/api';


type LayoutSwitchParams = {
  mode?: 0 | 1 | 2,
  onChange?: (value: 0 | 1 | 2) => void
}


const LayoutSwitch = (
  { 
    mode=0, onChange 
  }: LayoutSwitchParams
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
      <VscLayoutSidebarLeftOff 
          title='Show Preview to the right'
          className={
            'cursor-pointer z-10 transition-transform duration-100 ' + 
            (mode==0 ? 'scale-150' : '')
          }
          onClick={() => layout_onChange(0)} />
      <VscLayoutSidebarLeftOff 
          title='Show Preview to the bottom'
          className={
            'cursor-pointer rotate-90 z-10 transition-transform duration-100 ' + 
            (mode==1 ? 'scale-150' : '')
          }
          onClick={() => layout_onChange(1)} />
      <IoIosExpand 
          title='Enter Fullscreen'
          className={
            'cursor-pointer z-10 transition-transform duration-100 ' + 
            (mode==2 ? 'scale-150' : '')
          }
          onClick={() => layout_onChange(2)} />
    </div>
  )
}

export type TemplateTemplateParams = {
  dash: {
    editor?: {
      width?: string,
      height?: string,
      options?: EditorProps["options"]
    },
    isHtml?: boolean,
    defaultMode?: 0|1|2,
    showLayoutSwitcher?: boolean 
  },
} & 
FieldLeafViewParams<TemplateType["template_html" | "template_text" | 'template_subject']>
&
React.ComponentProps<'div'>;

export const TemplateTemplate = (
  { 
    field, context, setError, value, onChange, 

    dash: {isHtml=true, editor, defaultMode=0, showLayoutSwitcher=true},
    ...rest 
  }: TemplateTemplateParams
) => {
  const monaco = useMonaco();
  const [mode, setMode] = useState<0|1|2>(defaultMode as 0|1|2);
  const [example, setExample] = useState({});
  const [template, setTemplate] = useState(value);
  const { darkMode } = useDarkMode();

  // console.log(template)

  const editor_onChange: Parameters<typeof Editor>["0"]["onChange"] = useCallback(
    (value) => {
      setTemplate(value);
      onChange(value);
    }, [onChange]
  );

  /** @type {Parameters<typeof LayoutSwitch>["0"]["onChange"]} */
  const layout_onChange = useCallback(
    (value) => {
      setMode(value);
    }, []
  );

  const preview_compiled = useMemo(
    () => {
      try {
        // const handlebarsTemplate = Handlebars.compile(template);
        const handlebarsTemplate = Minibars.compile(template);
        let parsed = handlebarsTemplate(example ?? {});

        if(!isHtml) {
          parsed = `<pre>${parsed}</pre>`
        }

        return parsed;
      } catch(e) {
        return e
      }
    }, [template, example, isHtml]
  );


  useEffect(
    () => {
      return context.pubsub.add_sub(
        /**
         * @param {string} event 
         * @param {any} value 
         */
        (event, value) => {
          if(event!=='reference_example_input')
            return;

          setExample(value);
        }
      )
    }, [context]
  )

  useEffect(
    () => {
      monaco && monaco.editor.defineTheme(
        'coblat',
        {
          "base": "vs-dark",
          "inherit": true,
          "rules": [
            {
              "background": "002240",
              "token": ""
            },
            {
              "foreground": "e1efff",
              "token": "punctuation - (punctuation.definition.string || punctuation.definition.comment)"
            },
            {
              "foreground": "ff628c",
              "token": "constant"
            },
            {
              "foreground": "ffdd00",
              "token": "entity"
            },
            {
              "foreground": "ff9d00",
              "token": "keyword"
            },
            {
              "foreground": "ffee80",
              "token": "storage"
            },
            {
              "foreground": "3ad900",
              "token": "string -string.unquoted.old-plist -string.unquoted.heredoc"
            },
            {
              "foreground": "3ad900",
              "token": "string.unquoted.heredoc string"
            },
            {
              "foreground": "0088ff",
              "fontStyle": "italic",
              "token": "comment"
            },
            {
              "foreground": "80ffbb",
              "token": "support"
            },
            {
              "foreground": "cccccc",
              "token": "variable"
            },
            {
              "foreground": "ff80e1",
              "token": "variable.language"
            },
            {
              "foreground": "ffee80",
              "token": "meta.function-call"
            },
            {
              "foreground": "f8f8f8",
              "background": "800f00",
              "token": "invalid"
            },
            {
              "foreground": "ffffff",
              "background": "223545",
              "token": "text source"
            },
            {
              "foreground": "ffffff",
              "background": "223545",
              "token": "string.unquoted.heredoc"
            },
            {
              "foreground": "ffffff",
              "background": "223545",
              "token": "source source"
            },
            {
              "foreground": "80fcff",
              "fontStyle": "italic",
              "token": "entity.other.inherited-class"
            },
            {
              "foreground": "9eff80",
              "token": "string.quoted source"
            },
            {
              "foreground": "80ff82",
              "token": "string constant"
            },
            {
              "foreground": "80ffc2",
              "token": "string.regexp"
            },
            {
              "foreground": "edef7d",
              "token": "string variable"
            },
            {
              "foreground": "ffb054",
              "token": "support.function"
            },
            {
              "foreground": "eb939a",
              "token": "support.constant"
            },
            {
              "foreground": "ff1e00",
              "token": "support.type.exception"
            },
            {
              "foreground": "8996a8",
              "token": "meta.preprocessor.c"
            },
            {
              "foreground": "afc4db",
              "token": "meta.preprocessor.c keyword"
            },
            {
              "foreground": "73817d",
              "token": "meta.sgml.html meta.doctype"
            },
            {
              "foreground": "73817d",
              "token": "meta.sgml.html meta.doctype entity"
            },
            {
              "foreground": "73817d",
              "token": "meta.sgml.html meta.doctype string"
            },
            {
              "foreground": "73817d",
              "token": "meta.xml-processing"
            },
            {
              "foreground": "73817d",
              "token": "meta.xml-processing entity"
            },
            {
              "foreground": "73817d",
              "token": "meta.xml-processing string"
            },
            {
              "foreground": "9effff",
              "token": "meta.tag"
            },
            {
              "foreground": "9effff",
              "token": "meta.tag entity"
            },
            {
              "foreground": "9effff",
              "token": "meta.selector.css entity.name.tag"
            },
            {
              "foreground": "ffb454",
              "token": "meta.selector.css entity.other.attribute-name.id"
            },
            {
              "foreground": "5fe461",
              "token": "meta.selector.css entity.other.attribute-name.class"
            },
            {
              "foreground": "9df39f",
              "token": "support.type.property-name.css"
            },
            {
              "foreground": "f6f080",
              "token": "meta.property-group support.constant.property-value.css"
            },
            {
              "foreground": "f6f080",
              "token": "meta.property-value support.constant.property-value.css"
            },
            {
              "foreground": "f6aa11",
              "token": "meta.preprocessor.at-rule keyword.control.at-rule"
            },
            {
              "foreground": "edf080",
              "token": "meta.property-value support.constant.named-color.css"
            },
            {
              "foreground": "edf080",
              "token": "meta.property-value constant"
            },
            {
              "foreground": "eb939a",
              "token": "meta.constructor.argument.css"
            },
            {
              "foreground": "f8f8f8",
              "background": "000e1a",
              "token": "meta.diff"
            },
            {
              "foreground": "f8f8f8",
              "background": "000e1a",
              "token": "meta.diff.header"
            },
            {
              "foreground": "f8f8f8",
              "background": "4c0900",
              "token": "markup.deleted"
            },
            {
              "foreground": "f8f8f8",
              "background": "806f00",
              "token": "markup.changed"
            },
            {
              "foreground": "f8f8f8",
              "background": "154f00",
              "token": "markup.inserted"
            },
            {
              "background": "8fddf630",
              "token": "markup.raw"
            },
            {
              "background": "004480",
              "token": "markup.quote"
            },
            {
              "background": "130d26",
              "token": "markup.list"
            },
            {
              "foreground": "c1afff",
              "fontStyle": "bold",
              "token": "markup.bold"
            },
            {
              "foreground": "b8ffd9",
              "fontStyle": "italic",
              "token": "markup.italic"
            },
            {
              "foreground": "c8e4fd",
              "background": "001221",
              "fontStyle": "bold",
              "token": "markup.heading"
            }
          ],
          "colors": {
            "editor.foreground": "#FFFFFF",
            "editor.background": "#1e293b",
            "editor.selectionBackground": "#B36539BF",
            "editor.lineHighlightBackground": "#00000059",
            "editorCursor.foreground": "#FFFFFF",
            "editorWhitespace.foreground": "#FFFFFF26"
          }
        }
      )
    }, [monaco]
  );

  useEffect(
    () => {
      const listener = (e) => {
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
    {
      showLayoutSwitcher &&
      <LayoutSwitch 
        onChange={layout_onChange} 
        mode={mode}
      />
    }
    
    { mode<2 &&
      <div className='w-full flex flex-col gap-5 relative'>
        {
          mode==1 && 
          'The following template'
        }
        <Editor
          options={{tabSize: 2, minimap: {autohide: true}, ...editor?.options}}
          width={editor?.width ?? '100%'}
          height={editor?.height ?? '500px'}
          className='rounded-md border shelf-border-color overflow-clip'
          onChange={editor_onChange}
          value={template}
          theme={darkMode ? 'coblat' : 'light'}
          defaultLanguage='handlebars'
          // defaultValue="// some comment"
          // onMount={handleEditorDidMount}
        />
        {
          mode==1 && 
          'will render'
        }
        <iframe 
          srcDoc={preview_compiled} 
          className={
            `${mode==0 ? 'absolute translate-x-10 left-full top-0 w-full ' : ''} 
            rounded-md border shelf-border-color resize overflow-auto bg-white`
          }
          height={editor?.height ?? '500px'} />
      </div>
    }
    {
      mode==2 &&
      <Splitter className='z-[100] fixed left-0 top-0 w-full h-full'>
        <Editor
          options={{tabSize: 2}}
          width={editor?.width ?? '100%'}
          height={'100%'}
          className='--overflow-auto'
          onChange={editor_onChange}
          value={template}
          theme={darkMode ? 'coblat' : 'light'}
          // theme='vs-dark'
          defaultLanguage='handlebars'
          // defaultValue="// some comment"
          // onMount={handleEditorDidMount}
        />
        <div className='w-full h-full flex-col items-center'>  
          <div className='flex flex-row items-center text-2xl 
            shelf-plain-card-soft justify-between w-full p-3'>
            <span children='Preview' />
            <FaRegWindowClose 
              onClick={() => setMode(0)} 
              className='cursor-pointer'/>
          </div>
          <iframe 
            width='100%'
            srcDoc={preview_compiled} 
            className={
              ` border shelf-border-color bg-white` 
            }
            height="100%" 
          />
        </div>  
      </Splitter>
    }
  </div>

</div>
  )
}

export default TemplateTemplate