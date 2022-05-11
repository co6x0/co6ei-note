import Script from 'next/script'
import 'styles/globals.scss'
import styles from 'styles/app.module.scss'
import { AppProps } from 'next/app'
import { Header } from 'components/Header'
import { Footer } from 'components/Footer'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={styles.root}>
      {/* Global site tag (gtag.js) - Google Analytics */}
      {process.env.NODE_ENV === 'production' && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTAG_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            
              gtag('config', '${process.env.NEXT_PUBLIC_GTAG_ID}');
            `}
          </Script>
        </>
      )}
      <Header />
      <main>
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  )
}
