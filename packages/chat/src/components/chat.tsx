import { useCallback, useEffect, useRef, useState } from "react"
import { ChatInputView } from "./chat-input"
import { ChatMessagesView } from "./chat-messages"
import { fixture_chat_1 } from "./chat.fixture"
import { delta_to_scroll_end } from "./chat.utils"
import { FaArrowDownLong } from "react-icons/fa6";
import useDarkMode from "@/hooks/use-dark-mode"
import { ChatMessagesViewImperativeInterface } from "./chat-message"
import { useChat } from "@/hooks/use-chat"
import { content } from "@storecraft/core/ai"



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
  const { darkMode } = useDarkMode();
  const {
    loading, messages, error, threadId,
    actions: {
      speak
    }
  } = useChat();


  const onSend = useCallback(
    (contents: content[]) => {
      speak(contents);
    }, [speak]
  );

  const dark_class = darkMode ? 'dark' : '';
  
  return (
    <div className={dark_class + ` chat-bg chat-text w-screen 
          h-screen flex flex-row justify-center items-center
          font-inter`} >
      <div className='max-w-[800px] w-full h-full relative --bg-red-100 
              flex flex-col gap-0 items-center'>

        <ChatMessagesView messages={messages} 
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

        <ChatInputView chat={{onSend}} className='w-full absolute bottom-10 px-3' />

      </div>      
    </div>
  )
}




////



const test_sync = async (text: string = '') => {
  const sdk = new StorecraftSDK({endpoint: 'http://localhost:8000'});

  const sync = await sdk.ai.speak(
    {
      prompt: [
        {
          type: "text",
          content: "What is the price of Super Mario for the NES console ?"
        }
      ]
    } 
  );

  console.log(sync)
}

const test = async (text: string = '') => {
  const sdk = new StorecraftSDK({endpoint: 'http://localhost:8000'});

  const gen = await sdk.ai.streamSpeak(
    {
      prompt: [
        {
          type: "text",
          content: "What is the price of Super Mario for the NES console ?"
        }
      ]
    } 
  );

  for await (const chunk of gen) {
    console.log(chunk)
  }
}


const test2 = async (text: string = '') => {

  const response = await fetch(
    'http://localhost:8000/api/ai/agent/stream',
    {
      method: 'post',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          prompt: [
            {
              type: "text",
              content: "What is the price of Super Mario for the NES console ?"
            }
          ]
        } 
      )
    }
  );

  for await (const chunk of response.body) {
    console.log('chunk, ', new TextDecoder().decode(chunk))
  }

}
