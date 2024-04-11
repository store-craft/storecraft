export * from './useCollection.js'
export * from './useDocument.js'
import createUserHook from './common/createUserHook.js'
import  { getSDK } from '../admin-sdk/index.js'

export const useUser = createUserHook(getSDK)
