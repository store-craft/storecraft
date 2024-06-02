import Main from './routes.jsx'
import { HashRouter as Router } from 'react-router-dom'
import ShowIf from './comps/show-if.jsx'
import Login from './login.jsx'
import Head from 'next/head.js';
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
<Router >
  {/* <Head>
    <title>
      Storecraft - Next Gen Commerce As Code (Headless)
    </title>
    <meta
      name="description"
      content="SHELF transforms your Firebase project into a Headless store CMS and it's FREE"
      key="desc"
    />
  </Head> */}
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