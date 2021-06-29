import Link from 'next/link'
import useSWR from 'swr'
//
import styles from './style.module.scss'
import { LoadingSpinner } from 'components/LoadingSpinner'

type Props = {
  href: string
  children: string[] | undefined
}

type ResOgp = {
  originTitle: string
  title?: string
  image?: string
  description?: string
}

export const ArticleLink: React.VFC<Props> = ({ href, children }) => {
  const cmsUrl = String('https://' + process.env.NEXT_PUBLIC_CMS_DOMAIN)
  const splitBaseUrl = (href: string) => href.replace(cmsUrl, '')

  // CMSのURLの場合はサイト内リンクを使用する
  // todo: ブログ本体のURLの場合の処理も追加する（localhostでは本番と異なる挙動になるのでそこも注意）
  if (href.startsWith(cmsUrl))
    return (
      <Link href={splitBaseUrl(href)}>
        <a>{children !== undefined ? children[0] : 'リンクタイトル未設定'}</a>
      </Link>
    )

  // childrenにhrefと異なるテキストが設定されている場合はテキストリンクを使用する
  if (children !== undefined && children[0] !== href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children[0]}
      </a>
    )

  // 外部URLがそのまま設定されている場合はOGPから情報を取得して表示する
  const fetcher = async (href: string): Promise<ResOgp> => {
    try {
      const response = await fetch(`/api/getOgp?url=${href}`)
      return response.json()
    } catch (error) {
      throw new Error(error)
    }
  }

  const { data, error } = useSWR(href, fetcher)
  if (error) return <></>
  if (!data) return <LoadingSpinner />
  const formatImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('//')) {
      return 'https:' + imageUrl
    }
    if (imageUrl.startsWith('/')) {
      return '/images/no-link-image.png'
    }
    return imageUrl
  }

  return (
    <a
      href={href}
      className={styles.card}
      target="_blank"
      rel="noopener noreferrer"
    >
      {data.image && (
        <img
          src={formatImageUrl(data.image)}
          alt=""
          width="168"
          height="90"
          loading="lazy"
        />
      )}
      <span>
        <span className={styles.title}>{data.title ?? data.originTitle}</span>
        <span className={styles.desc}>{data.description ?? ''}</span>
        <span className={styles.url}>{href}</span>
      </span>
    </a>
  )
}
