import { initializeApp, getApps } from 'firebase/app'
import { initializeFirestore, enableIndexedDbPersistence, 
         getFirestore, 
         Firestore,
         persistentLocalCache,
         persistentMultipleTabManager} from 'firebase/firestore'
import { initializeAuth, browserLocalPersistence, 
         getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

/**
 * @typedef {object} Firebase
 * @property {import('firebase/app').FirebaseApp} Firebase.app 
 * @property {import('firebase/auth').Auth} Firebase.auth 
 * @property {Firestore} Firebase.db 
 * @property {import('firebase/storage').FirebaseStorage} Firebase.storage 
 * @property {FirebaseOptions} Firebase.config 
 */

/**
 * 
 * @param {import("firebase/app").FirebaseOptions} config 
 * @returns {Firebase}
 */
export const materializeConfig = (config) => {

  let app, auth, db, storage
  const name = `[shelf-admin-${config.projectId}]`
  app = getApps().find(a => a.name===name)

  if(app) {
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } else {
    app = initializeApp(config, name)
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: undefined,
    })
    db = initializeFirestore(
      app, 
      { 
        ignoreUndefinedProperties: true,
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      }
    )
    // enableIndexedDbPersistence(db).then(console.log).catch(console.log)
    storage = getStorage(app)
  } 
  // console.log('app', app)
  return { 
    app, auth, db, storage, 
    config : {...config}
  }
  
}