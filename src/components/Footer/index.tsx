import Image from 'next/image'
import styles from './style.module.scss'
import IconGitHub from 'assets/svg/github.svg'
import IconNote from 'assets/svg/note.svg'
import IconTwitter from 'assets/svg/twitter.svg'

export const Footer: React.VFC = () => {
  return (
    <footer className={styles.root}>
      <div className={styles.cat}>
        <Image src="/images/signyan.png" width="88" height="140" alt="猫" />
      </div>
      <div className={styles.links}>
        <div>
          <a
            href="https://twitter.com/co6ei"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconTwitter title="Twitter" />
          </a>
          <a
            href="https://note.com/sixa_nao"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconNote title="Note" />
          </a>
          <a
            href="https://github.com/naokomura"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconGitHub title="GitHub" />
          </a>
        </div>
        <small>Copyright © Nao Komura</small>
      </div>
    </footer>
  )
}
