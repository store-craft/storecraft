import useDarkMode from "@/hooks/use-dark-mode";
import { MdDarkMode } from "react-icons/md";
import { MdOutlineLightMode } from "react-icons/md";

export const DarkModeSwitch = () => {
  const { 
    darkMode, toggle
  } = useDarkMode();

  return (
    <button 
      onClick={toggle}
      children={darkMode ? <MdOutlineLightMode/> : <MdDarkMode />} 
      className='text-black dark:text-white cursor-pointer'/>
  )
}