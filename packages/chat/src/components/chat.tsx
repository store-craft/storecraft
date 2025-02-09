import { useCallback, useEffect, useRef, useState } from "react"
import { ChatInputView } from "./chat-input"
import { ChatMessagesView, ChatMessagesViewImperativeInterface } from "./chat-messages"
import { fixture_chat_1 } from "./chat.fixture"
import { delta_to_scroll_end } from "./chat.utils"
import { FaArrowDownLong } from "react-icons/fa6";

export const Chat = () => {

  const [showScroller, setShowScroller] = useState(false);

  const onChatMessagesScroll = useCallback(
    (div?: HTMLDivElement) => {
      setShowScroller(delta_to_scroll_end(div) > 100);
    }, []
  );

  const ref_chat_messages = useRef<ChatMessagesViewImperativeInterface>(null);

  const onScrollerClick = useCallback(
    () => {
      ref_chat_messages.current?.scroll();
    }, []
  );

  useEffect(
    () => {
      ref_chat_messages.current?.scroll();
    }, []
  );
  
  return (
    <div className='dark chat-bg chat-text w-screen 
          h-screen flex flex-row justify-center items-center
          font-inter'>
      <div className='max-w-[800px] w-full h-full relative --bg-red-100 
              flex flex-col gap-0 items-center'>

        <ChatMessagesView messages={fixture_chat_1} 
            onChatWindowScroll={onChatMessagesScroll}
            className='w-full h-full '
            ref={ref_chat_messages}/>

        <button className={`absolute mx-auto rounded-full border 
                transition-all duration-[400ms] cursor-pointer
                chat-bg chat-border-overlay ` + 
                (showScroller ? 'bottom-40' : 'bottom-20')}
                onClick={onScrollerClick}>
          <FaArrowDownLong className='w-6 h-6 m-px p-1' />
        </button>    

        <ChatInputView className='w-full absolute bottom-10 px-3' />

      </div>      
    </div>
  )
}