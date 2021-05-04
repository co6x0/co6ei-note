import { GetStaticProps, NextPage } from 'next'
import Link from 'next/link'
import Head from 'next/head'
import dayjs from 'dayjs'
import DOMPurify from 'isomorphic-dompurify'
import type { WP_REST_API_Posts } from 'wp-types'
//
import { getPosts } from 'lib/api'
import styles from 'styles/home.module.scss'
import { HtmlHead } from 'components/HtmlHead'

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getPosts()
  return {
    props: {
      posts,
    },
    revalidate: 1,
  }
}

const Home: NextPage<{ posts: WP_REST_API_Posts }> = ({ posts }) => {
  const convertDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD')
  }

  const htmlExcerpt = (excerpt: string) => DOMPurify.sanitize(excerpt)

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
            <li className={styles['article-list']} key={id}>
              <Link href={`/posts/${id}`}>
                <a>
                  <h2>{title.rendered}</h2>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: htmlExcerpt(excerpt.rendered),
                    }}
                  />
                  <time>{convertDate(date)}</time>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
export default Home
