import useDarkMode from "@/hooks/use-dark-mode";
import { MdDarkMode } from "react-icons/md";
import { MdOutlineLightMode } from "react-icons/md";
import { ToolTip } from "./tooltip";

export const DarkModeSwitch = () => {
  const { 
    darkMode, toggle
  } = useDarkMode();

  const tooltip_text = darkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode';

  return (
    <ToolTip tooltip={tooltip_text}>
      <button title={tooltip_text}
        onClick={toggle} 
        children={darkMode ? <MdOutlineLightMode/> : <MdDarkMode />} 
        className='text-black dark:text-white cursor-pointer translate-y-1'/>
    </ToolTip>
  )
}