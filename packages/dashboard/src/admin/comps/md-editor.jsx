import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { useState } from "react";

const Editor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
)

const MDEditor = ({field, value, onChange, ...rest}) => {
  const [md, setMd] = useState(value);
  const { key, name, comp_params } = field

  function handleEditorChange(text) {
    onChange(text)
    setMd(text)
  }

  return (
<div>
  <Editor preview='edit'  value={md} onChange={handleEditorChange} {...comp_params}
    className="bg-slate-400 "
    // data-color-mode='dark'
    style={{
    }} />
  {/* <MDEditor.Markdown source={md} style={{ whiteSpace: 'pre-wrap' }} {...comp_params} /> */}
</div>
  );
}

export default MDEditor