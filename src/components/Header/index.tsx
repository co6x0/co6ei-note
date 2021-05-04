import Image from 'next/image'
import Link from 'next/link'
import styles from './style.module.scss'

export const Header: React.VFC = () => {
  return (
    <header className={styles.root}>
      <h1>
        <Link href="/">
          <a>
            <Image
              src="/images/co6ei-note-logo.svg"
              width="176"
              height="64"
              alt="co6ei note"
            />
          </a>
        </Link>
      </h1>
    </header>
  )
}
