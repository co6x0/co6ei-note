import { GetStaticProps, NextPage } from 'next'
import Link from 'next/link'
// import DOMPurify from 'isomorphic-dompurify'
import type { WP_REST_API_Posts, WP_REST_API_Categories } from 'wp-types'
//
import { getPosts, getCategories } from 'lib/api'
import styles from 'styles/home.module.scss'
import { HtmlHead } from 'components/HtmlHead'
import { PostCard } from 'components/PostCard'
import ArticleIcon from 'assets/svg/description.svg'

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getPosts()
  const categories = await getCategories()
  return {
    props: {
      posts,
      categories,
    },
    revalidate: 1,
  }
}

const Home: NextPage<{
  posts: WP_REST_API_Posts
  categories: WP_REST_API_Categories
}> = ({ posts, categories }) => {
  return (
    <>
      <HtmlHead
        title="co6ei note"
        description="UI Designer, Product Manager, Web Engineerなどとしての仕事をするKomura Nao(小村奈央)による、デザインや開発やその他自分の興味のあることなどを記すブログ。"
        path="/"
      />

      <section className={styles.root}>
        <ul>
          {posts.map(({ id, title, excerpt, date }) => (
            <li key={id}>
              <PostCard
                href={`/posts/${id}`}
                title={title.rendered}
                excerpt={excerpt.rendered}
                date={date}
              />
            </li>
          ))}
        </ul>
        <nav>
          <h1>Blog Categories</h1>
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
        </nav>
      </section>
    </>
  )
}
export default Home
