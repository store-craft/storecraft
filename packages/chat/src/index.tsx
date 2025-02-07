import './index.css'

import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'

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
  a.handle
  return (
    <div className='bg-green-300'>
      TOMER
    </div>
  )
}