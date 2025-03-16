import Main from './routes.jsx'
import { HashRouter as Router } from 'react-router-dom'
import ShowIf from './comps/show-if.jsx'
import Login from './login.jsx'
import { useStorecraft } from '@storecraft/sdk-react-hooks';
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.scss'

/**
 * 
 * @description mount `storecraft` inside an `HTML` element.
 * This method returns an invokable `unmount` function.
 * 
 * 
 * @param {HTMLElement} el 
 * @param {boolean} [is_backend_endpoint_editable=true] 
 * 
 */
export const mountStorecraftDashboard = (el, is_backend_endpoint_editable=true) => {
  const root = ReactDOM.createRoot(el);

  root.render(
    // <React.StrictMode>
      <Dashboard is_backend_endpoint_editable={is_backend_endpoint_editable}/>
    // </React.StrictMode>,
  );

  return () => {
    root.unmount();
  }
}


/**
 * @typedef {object} DashboardParams
 * @prop {boolean} [is_backend_endpoint_editable=true]
 * 
 * 
 * @param {DashboardParams} params
 */
export const Dashboard = (
  {
    is_backend_endpoint_editable=true
  }
) => {
  const {
    isAuthenticated, 
    actions: {
      trigger
    }
  } = useStorecraft();

  return (
<div className='bg-gray-800 w-screen ' style={{height: '100dvh'}} >
  <div className='w-full h-full' style={{zoom: 0.9}} >
    <Router>
      
      { isAuthenticated && <Main /> }
      { 
        !isAuthenticated && 
        (
          <Login 
              trigger={trigger} 
              is_backend_endpoint_editable={is_backend_endpoint_editable} />
        )
      }
    </Router>
  </div>
</div>
  )
}

