import { ChatInputView } from "./chat-input"
import { ChatMessagesView } from "./chat-messages"
import { fixture_chat_1 } from "./chat.fixture"

export const Chat = () => {

  return (
    <div className='dark bg-gray-100 dark:bg-gray-800 chat-text w-screen 
          h-screen flex flex-row justify-center items-center
          font-inter'>
      <div className='w-[700px] max-w-full h-full relative --bg-red-100'>
        <ChatMessagesView messages={fixture_chat_1} 
            className='w-full h-full '/>
        <ChatInputView className='w-full absolute bottom-10 px-10' />
      </div>      
    </div>
  )
}