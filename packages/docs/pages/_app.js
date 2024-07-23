import '../src/index.scss'
import ClientOnly from '@/components/client-only.jsx'

function MyApp(
  { 
    Component, pageProps 
  }
) {

	return (
    <ClientOnly>
		  <Component {...pageProps} className='w-screen h-screen'  />
    </ClientOnly>
	)
}

export default MyApp;