export * from './src/useCollection.js'
export * from './src/useDocument.js'
import createUserHook from './src/createUserHook.js'
import  { getSDK } from '@storecraft/sdk/index.js'

export const useUser = createUserHook(getSDK)
