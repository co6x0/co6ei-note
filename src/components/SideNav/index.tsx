import Link from 'next/link'
import styles from './style.module.scss'
import { IconDescription, IconOpenInNew } from 'assets/svg-components'
import type { PostCategory } from 'types/post'

type Props = {
  categories: PostCategory[]
}

export const SideNav: React.VFC<Props> = ({ categories }) => {
  return (
    <nav className={styles.root}>
      <ul>
        {categories.map(({ name, slug, count }) => (
          <li className={styles['category-list']} key={slug}>
            <Link href={`/categories/${slug}`}>
              <a>
                <h2>{name}</h2>
                <div className={styles.count}>
                  <IconDescription title="記事数" />
                  <p>{count}</p>
                </div>
              </a>
            </Link>
          </li>
        ))}
      </ul>

      <hr />

      <a href="https://unify.sixaxd.com" className={styles.portfolio}>
        <p>Portfolio</p>
        <IconOpenInNew title="外部サイトへアクセス" />
      </a>
    </nav>
  )
}
