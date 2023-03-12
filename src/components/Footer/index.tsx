import Image from 'next/image'
import styles from './style.module.scss'
import { IconGitHub, IconNote, IconTwitter } from 'assets/svg-components'

export const Footer: React.VFC = () => {
  return (
    <footer className={styles.root}>
      <div className={styles.cat}>
        <Image
          src="/images/signyan.png"
          width="88"
          height="140"
          priority={true}
          alt="猫"
        />
      </div>
      <div className={styles.links}>
        <div>
          <a
            href="https://twitter.com/co6x0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconTwitter title="Twitter" />
          </a>
          <a
            href="https://note.com/co6x0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconNote title="Note" />
          </a>
          <a
            href="https://github.com/co6x0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconGitHub title="GitHub" />
          </a>
        </div>
        <small>Copyright © 2019&mdash; Nao Komura</small>
      </div>
    </footer>
  )
}
