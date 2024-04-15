import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic.js";
import { useState } from "react";

const Editor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
)

/**
 * @typedef {object} InternalMDEditorParams
 * @prop {import("./fields-view.jsx").FieldData} [field]
 * @prop {string} [value]
 * @prop {(value: string) => void} [onChange]
 * 
 * @typedef {InternalMDEditorParams & 
*  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
* } MDEditorParams
* 
* @param {MDEditorParams} param
*/
const MDEditor = ({field, value, onChange, ...rest}) => {
  const [md, setMd] = useState(value);
  const { key, name, comp_params } = field

  function handleEditorChange(text) {
    onChange(text)
    setMd(text)
  }

  return (
<div>
  <Editor preview='edit'  value={md} 
    onChange={handleEditorChange} {...comp_params}
    className="bg-slate-400 "
    // data-color-mode='dark'
    style={{
    }} />
  {/* <MDEditor.Markdown source={md} style={{ whiteSpace: 'pre-wrap' }} {...comp_params} /> */}
</div>
  );
}

export default MDEditor