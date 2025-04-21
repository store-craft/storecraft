import MdEditor from 'react-markdown-editor-lite';
import './md-editor.css';
import { marked } from 'marked'


import { useEffect, useState } from "react";
import { FieldData } from "./fields-view";
import useDarkMode from '@/hooks/use-dark-mode';


export type MDEditorParams = {
  field?: FieldData;
  value?: string;
  onChange?: (value: string) => void;
} & React.ComponentProps<'div'>;

const MDEditor = (
  {
    field, value, onChange, ...rest
  }: MDEditorParams
) => {
  const [md, setMd] = useState(value);
  const { key, name, comp_params } = field
  const { darkMode } = useDarkMode();

  const handleEditorChange = (value: { text: string, html: string }) => {
    console.log('value', value)
    onChange(value.text)
    setMd(value.text)
  }

  return (
<div>
  <MdEditor 
    {...comp_params}
    className={"h-[300px] " + (darkMode ? 'dark' : 'light')} 
    value={md}
    renderHTML={text => marked.parse(text)} 
    onChange={handleEditorChange} 
  />

  {/* <Editor 
      preview='edit'  
      value={md} 
      onChange={handleEditorChange} 
      {...comp_params}
      className="bg-white dark:bg-slate-800 "
    // data-color-mode='dark'
      style={{
        color: 'inherit',
        // background: '#1e293b40' 
      }} /> */}
  {/* <MDEditor.Markdown source={md} style={{ whiteSpace: 'pre-wrap' }} {...comp_params} /> */}
</div>
  );
}

export default MDEditor