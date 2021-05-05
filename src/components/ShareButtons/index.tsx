import { Toaster, toast } from 'react-hot-toast'
import { share } from 'utils/share'
import IconTwitter from 'assets/svg/twitter-solid.svg'
import IconShare from 'assets/svg/share.svg'
import styles from './style.module.scss'

type Props = {
  title: string
  path: string
}

export const ShareButtons: React.VFC<Props> = ({ title, path }) => {
  const text = `${title}｜co6ei note`
  const url = `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}${path}`
  const linkUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${url}`
  const handleClick = () => {
    const result = share({ text, url })
    if (result === 'success')
      toast.success('記事のリンクとテキストをコピーしました')
    if (result === 'error')
      toast.error('記事のリンクとテキストのコピーに失敗しました')
  }

  return (
    <div className={styles.root}>
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="記事をTwitterで共有"
      >
        <IconTwitter title="記事をTwitterで共有" />
      </a>
      <button onClick={handleClick} aria-label="記事を共有する">
        <IconShare title="記事を共有する" />
      </button>

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            margin: '40px',
            borderRadius: '4px',
            boxShadow: '0 4px 12px -4px rgba(0,0,0,0.16)',
            background: '#f8f8fa',
          },
          duration: 4000,
        }}
      />
    </div>
  )
}
