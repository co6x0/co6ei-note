import Image from 'next/image'
import styles from './style.module.scss'

type Props = {
  src: string
  directoryName: string
  alt?: string
  children?: string[]
}

export const ArticleImage: React.VFC<Props> = ({ alt, src, directoryName }) => {
  const fileName = src.slice(src.lastIndexOf('/') + 1, src.length)
  const srcPath = `/images/posts/${directoryName}/${fileName}`

  return (
    <div className={styles['article-image']}>
      <Image src={srcPath} alt={alt ?? ''} layout="fill" objectFit="contain" />
    </div>
  )
}
