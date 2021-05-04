import 'styles/globals.scss'
import styles from 'styles/app.module.scss'
import { AppProps } from 'next/app'
import { Header } from 'components/Header'
import { Footer } from 'components/Footer'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={styles.root}>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </main>
  )
}
