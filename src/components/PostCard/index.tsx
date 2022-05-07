import Link from 'next/link'
import styles from './style.module.scss'
import { PostDate } from 'components/PostDate'

type Props = {
  href: string
  title: string
  date: string
  excerpt: string
}

export const PostCard: React.VFC<Props> = (props) => {
  const removeHtmlTag = (text: string) => {
    return text.replace(/(<([^>]+)>)/gi, '').replace('[&hellip;]', '…')
  }

  return (
    <Link href={props.href}>
      <a className={styles.root}>
        <em>{props.title}</em>
        <p>{removeHtmlTag(props.excerpt)}</p>
        <PostDate dateString={props.date} />
      </a>
    </Link>
  )
}
