import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic.js";
import { useState } from "react";

const Editor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
)

/**
 * @template C the extra `context` type
 * @template O the entire original data type
 * 
 * 
 * @typedef {import("./fields-view.jsx").FieldLeafViewParams<
 *  string, C, O
 * >} InternalMDEditorParams
 */


/**
 * @template C the extra `context` type
 * @template O the entire original data type
 * 
 * @typedef {InternalMDEditorParams<C, O> & 
 *  Omit<
 *    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 
 *    keyof InternalMDEditorParams<C, O>
 *  >
 * } MDEditorParams
 * 
 */

/** 
 * @template C the extra `context` type
 * @template O the entire original data type
 * 
 * 
 * @param {MDEditorParams<C, O>} param
 */
const MDEditor = (
  {
    field, value, onChange, ...rest
  }
) => {

  const [md, setMd] = useState(value);
  const { key, name, comp_params } = field;

  /**
   * 
   * @param {string} text 
   */
  const handleEditorChange = (text) => {
    onChange(text);
    setMd(text);
  }

  return (
<div>
  <Editor 
      preview='edit'  
      value={md} 
      onChange={handleEditorChange} 
      {...comp_params}
      className="bg-slate-400 "
      // data-color-mode='dark'
      style={{}} />
      
  {/* <MDEditor.Markdown source={md} style={{ whiteSpace: 'pre-wrap' }} {...comp_params} /> */}
</div>
  );
}

export default MDEditor