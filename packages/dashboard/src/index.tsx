import Main from './routes'
import { HashRouter as Router } from 'react-router-dom'
import Login from './login'
import { useStorecraft } from '@storecraft/sdk-react-hooks';
import ReactDOM from 'react-dom/client'
import './index.css'
import { useEffect } from 'react';

/**
 * 
 * @description mount `storecraft` inside an `HTML` element.
 * This method returns an invokable `unmount` function.
 * @param el html element to mount the dashboard
 * @param is_backend_endpoint_editable to show the backend endpoint input field ?
 */
export const mountStorecraftDashboard = (
  el: HTMLElement, is_backend_endpoint_editable: boolean=true
) => {
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

type DashboardParams = {
  is_backend_endpoint_editable?: boolean
}

export const Dashboard = (
  {
    is_backend_endpoint_editable=true
  }: DashboardParams
) => {
  const {
    isAuthenticated, 
    actions: {
      trigger
    }
  } = useStorecraft();

  useEffect(
    () => {
      if(!isAuthenticated) {
        window.history.replaceState(null, null, '/');
      }
    }, [isAuthenticated]
  );

  console.log('isAuthenticated', isAuthenticated)
  return (
<div className='bg-gray-800 w-screen ' style={{height: '100dvh'}} >
  <div className='w-full h-full' style={{zoom: 0.9}} >
    {
      isAuthenticated &&
      (
        <Router>
          <Main /> 
        </Router>
      )
    }
    { 
      !isAuthenticated && 
      (
        <Login 
          trigger={trigger} 
          is_backend_endpoint_editable={is_backend_endpoint_editable} />
      )
    }
  </div>
</div>
  )
}

