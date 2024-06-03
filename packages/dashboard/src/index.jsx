import Main from './routes.jsx'
import { HashRouter as Router } from 'react-router-dom'
import ShowIf from './comps/show-if.jsx'
import Login from './login.jsx'
import { useStorecraft } from '@storecraft/sdk-react-hooks';
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.scss'

/**
 * 
 * @description mount `storecraft` inside an `HTML` element.
 * This method returns an invokable `unmount` function.
 * 
 * 
 * @param {HTMLElement} el 
 * 
 */
export const mountStorecraftDashboard = (el) => {
  const root = ReactDOM.createRoot(el);

  root.render(
    // <React.StrictMode>
      <Dashboard/>
    // </React.StrictMode>,
  );

  return () => {
    root.unmount();
  }
}


export const Dashboard = ({}) => {
  const {
    isAuthenticated, 
    actions: {
      trigger
    }
  } = useStorecraft();

  const isGood = isAuthenticated;

  // return 'hello';
  
  return (
<Router>
  <ShowIf show={isGood}>
    <Main />
  </ShowIf>    
  <ShowIf show={!isGood}>
    <Login trigger={trigger} />
  </ShowIf>    
</Router>
  )
}
