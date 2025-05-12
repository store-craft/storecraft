import '../src/index.css'
import ClientOnly from '@/components/client-only'

function MyApp(
  { 
    Component, pageProps 
  }: {
    Component: React.FC<any>;
    pageProps: object;
  }
) {

	return (
		<Component {...pageProps} className='w-screen h-screen'  />
	)
}

export default MyApp;