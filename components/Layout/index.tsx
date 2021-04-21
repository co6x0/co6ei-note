import styles from './style.module.scss'

type Props = {
  children: React.ReactNode
}

export const Layout: React.VFC<Props> = (props) => {
  return <div className={styles.container}>{props.children}</div>
}
