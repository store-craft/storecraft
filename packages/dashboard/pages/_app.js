import '../styles/globals.scss'
import ClientOnly from '../src/admin/comps/client-only'
import Script from 'next/script'

const GA_MEASUREMENT_ID = 'G-NQE9M7434S'

function MyApp({ Component, pageProps }) {
	return (
    <ClientOnly className='w-screen h-screen'>
      <Script strategy="afterInteractive" 
        src={`https://www.googletagmanager.com/gtag/js?id=G-NQE9M7434S`} />
      <Script
        id='google-analytics'
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            const url = window.location.pathname + (window.location.search ?? '');
            gtag('config', 'G-NQE9M7434S', {
              page_path: url
            });
            // alert(url)
          `,
          }}
      />
		  <Component {...pageProps} className='w-screen h-screen'  />
    </ClientOnly>
	)
}

export default MyApp