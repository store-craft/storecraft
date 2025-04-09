import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
// import Editor from "@uiw/react-md-editor/nohighlight";
import type Editor from "@uiw/react-md-editor/nohighlight";
import { useEffect, useState } from "react";
import { FieldData } from "./fields-view.jsx";


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

  function handleEditorChange(text) {
    onChange(text)
    setMd(text)
  }

  const [E, setE] = useState<Editor>();

  useEffect(
    () => {
      // import('https://cdn.jsdelivr.net/npm/@uiw/react-md-editor@4.0.5/+esm').then((mod) => {
      import('https://cdn.jsdelivr.net/npm/@uiw/react-md-editor@4.0.5/esm/Editor.nohighlight.js').then((mod) => {
        setE(mod);
      });
    }
  )

  console.log('E', E)

  if(!E) 
    return <div className="w-full h-full" children='loading' />

  return (
<div>
  <E.default
      preview='edit'  
      value={md} 
      onChange={handleEditorChange} 
      {...comp_params}
      className="bg-white dark:bg-slate-800 "
    // data-color-mode='dark'
      style={{
        color: 'inherit',
        // background: '#1e293b40' 
      }} />
  {/* <MDEditor.Markdown source={md} style={{ whiteSpace: 'pre-wrap' }} {...comp_params} /> */}
</div>
  );
}

export default MDEditor