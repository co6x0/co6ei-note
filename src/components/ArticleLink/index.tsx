import Link from 'next/link'
import useSWR from 'swr'
import classnames from 'classnames'
import styles from './style.module.scss'
import { LoadingSpinner } from 'components/LoadingSpinner'

type Props = {
  href: string
  text?: string
}

type ResOgp = {
  originTitle: string
  title?: string
  image?: string
  description?: string
}

export const ArticleLink: React.VFC<Props> = ({ href, text }) => {
  const siteUrl = `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}`
  const splitBaseUrl = (href: string) => href.replace(siteUrl, '')

  // textにhrefと異なるテキストが設定されている場合はテキストリンクを使用する
  if (href === '#') {
    return <Link href={splitBaseUrl(href)}>{text}</Link>
  }
  if (text !== undefined && text !== href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {text}
      </a>
    )
  }

  const fetcher = async (href: string): Promise<ResOgp> => {
    const response = await fetch(`/api/getOgp?url=${href}`)

    if (!response.ok) {
      const error: Error & { info?: Promise<any>; status?: number } = new Error(
        'An error occurred while fetching the data.'
      )
      error.info = await response.json()
      error.status = response.status
      throw error
    }

    return response.json()
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data, error } = useSWR(href, fetcher)

  if (error) {
    return (
      <a
        href={href}
        className={classnames(styles.card, styles['-error'])}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>
          <span className={styles.title}>{href}</span>
          <span className={styles.desc}>データが取得できませんでした</span>
          <span
            className={styles.url}
          >{`${error.info.code}: ${error.info.message}`}</span>
        </span>
      </a>
    )
  }
  if (!data) {
    return (
      <div className={classnames(styles.card, styles['-loading'])}>
        <LoadingSpinner />
      </div>
    )
  }

  const formatImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('//')) {
      return 'https:' + imageUrl
    }
    if (imageUrl.startsWith('/')) {
      return '/images/no-link-image.png'
    }
    return imageUrl
  }

  // 当ブログのURLの場合はサイト内リンクを使用する
  return href.startsWith(siteUrl) ? (
    <Link href={splitBaseUrl(href)}>
      <a className={styles.card}>
        {data.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={formatImageUrl(data.image)}
            alt=""
            width="168"
            height="90"
            loading="lazy"
          />
        )}
        <span>
          <span className={styles.title}>
            {data.title !== undefined && data.title.length !== 0
              ? data.title
              : data.originTitle}
          </span>
          <span className={styles.desc}>{data.description ?? ''}</span>
          <span className={styles.url}>{href}</span>
        </span>
      </a>
    </Link>
  ) : (
    <a
      href={href}
      className={styles.card}
      target="_blank"
      rel="noopener noreferrer"
    >
      {data.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={formatImageUrl(data.image)}
          alt=""
          width="168"
          height="90"
          loading="lazy"
        />
      )}
      <span>
        <span className={styles.title}>
          {data.title !== undefined && data.title.length !== 0
            ? data.title
            : data.originTitle}
        </span>
        <span className={styles.desc}>{data.description ?? ''}</span>
        <span className={styles.url}>{href}</span>
      </span>
    </a>
  )
}
