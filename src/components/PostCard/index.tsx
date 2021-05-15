import Link from 'next/link'
import dayjs from 'dayjs'
import styles from './style.module.scss'

type Props = {
  href: string
  title: string
  date: string
  excerpt: string
}

export const PostCard: React.VFC<Props> = (props) => {
  const convertDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD')
  }
  const removeHtmlTag = (text: string) => {
    return text.replace(/(<([^>]+)>)/gi, '').replace('[&hellip;]', '…')
  }

  return (
    <Link href={props.href}>
      <a className={styles.root}>
        <em>{props.title}</em>
        <p>{removeHtmlTag(props.excerpt)}</p>
        <time>{convertDate(props.date)}</time>
      </a>
    </Link>
  )
}
