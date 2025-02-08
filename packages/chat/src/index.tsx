import './index.css'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { ChatInput } from './components/chat-input'

export const mountChat = () => {
  createRoot(
    document.getElementById('root')!
  ).render(
    <StrictMode>
      <Chat />
    </StrictMode>,
  )
}

export const Chat = () => {
  return (
    <div className='w-screen h-screen flex flex-row justify-center items-center'>
      <div className='w-[400px] h-32 font-inter '>

        <ChatInput />
      </div>
    </div>
  )
}