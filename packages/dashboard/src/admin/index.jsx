import React, { useEffect, useState } from 'react'
import Main from './main.jsx'
import { HashRouter as Router } from 'react-router-dom'
import { getSDK } from '@/admin-sdk/index.js'
import ShowIf from './comps/show-if.jsx'
import Login from './login.jsx'
import useTrigger from '@/admin-sdk-react-hooks/useTrigger.js'
import Head from 'next/head.js';

const useSDK = () => {
  const [isInit, setIsInit] = useState(false)
  const [isAuth, setIsAuth] = useState(undefined)
  const trigger = useTrigger()

  useEffect(
    () => {
      console.log('effect')
      try {
        const sdk = getSDK()
        if(sdk.auth.isAuthenticated)
          setIsAuth(true)

        const unsub = sdk.auth.add_sub(
          ([user, isAuth]) => {
            console.log('[user, isAuth]', [user, isAuth]);
            setIsAuth(isAuth)
          }
        )

        setIsInit(true)

        return unsub
      } catch (e) {
        setIsInit(false)
        console.log('Shelf Error ', e)
      }
    }, [trigger, getSDK]
  )

  return [
    isInit, isAuth, 
    isInit ? getSDK() : undefined, 
    trigger
  ]
}


export default function Index({children, ...rest}) {
  // useEffect(() => {
  //   dynamic(() => import('./shelf'))
  // }, [])
  const [isInit, isAuth, _, trigger] = useSDK()
  const isGood = isInit && isAuth
  // console.log(isInit, isAuth)
  return (

  <Router >
    <Head>
      <title>
        Storecraft - Next Gen Commerce As Code (Headless)
      </title>
      <meta
        name="description"
        content="SHELF transforms your Firebase project into a Headless store CMS and it's FREE"
        key="desc"
      />
    </Head>
    <ShowIf show={isGood}>
      <Main />
    </ShowIf>    
    <ShowIf show={!isGood}>
      <Login trigger={trigger} />
    </ShowIf>    
  </Router>
)
}
