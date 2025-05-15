import { useCallback, useState } from "react";
import { type withDiv } from "./common.types";
import { sleep } from "@/hooks/sleep";
import { ShowBinarySwitch } from "../common/show-if";
import { HiOutlineDuplicate } from "react-icons/hi";
import { MdDone } from "react-icons/md";

export const CopyClipboard = (
  {
    copy_text, ...rest
  }: withDiv<{copy_text: string}>
) => {

  const [wasCopied, setWasCopied] = useState(false);
  const onClick = useCallback(
    async() => {
      if(!copy_text)
        return;
      await navigator.clipboard.writeText(copy_text);
      setWasCopied(true);
      await sleep(1500);
      setWasCopied(false);
    }, [copy_text]
  );

  return (
    <div {...rest}>
      <ShowBinarySwitch toggle={wasCopied}>
        <HiOutlineDuplicate 
          className='text-xl opacity-80 hover:opacity-100 cursor-pointer'
          onClick={onClick} />

        <MdDone className='text-xl opacity-80 
                  hover:opacity-100 cursor-pointer text-green-600'/>
      </ShowBinarySwitch>     
    </div>
  )
}