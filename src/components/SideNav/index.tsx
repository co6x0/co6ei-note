import Link from 'next/link'
import type { WP_REST_API_Categories } from 'wp-types'
//
import styles from './style.module.scss'
import ArticleIcon from 'assets/svg/description.svg'
import OpenIcon from 'assets/svg/openinnew.svg'

type Props = {
  categories: WP_REST_API_Categories
}

export const SideNav: React.VFC<Props> = ({ categories }) => {
  return (
    <nav className={styles.root}>
      <ul>
        {/* 親カテゴリーを持たない最上位のカテゴリーのみ取得 */}
        {categories
          .filter((category) => category.parent === 0)
          .map(({ id, name, count }) => (
            <li className={styles['category-list']} key={id}>
              <Link href={`/categories/${id}`}>
                <a>
                  <h2>{name}</h2>
                  <div className={styles.count}>
                    <ArticleIcon title="記事数" />
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
        <OpenIcon title="外部サイトへアクセス" />
      </a>
    </nav>
  )
}
