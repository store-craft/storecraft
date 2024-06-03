import Main from './routes.jsx'
import { HashRouter as Router } from 'react-router-dom'
import ShowIf from './comps/show-if.jsx'
import Login from './login.jsx'
import { useStorecraft } from '@storecraft/sdk-react-hooks';


const Index = ({}) => {
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

export default Index;