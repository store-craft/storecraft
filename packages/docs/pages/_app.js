import '../styles/globals.scss'
import ClientOnly from '@/admin/comps/client-only.jsx'

function MyApp({ Component, pageProps }) {
	return (
    <ClientOnly className='w-screen h-screen'>
		  <Component {...pageProps} className='w-screen h-screen'  />
    </ClientOnly>
	)
}

export default MyApp