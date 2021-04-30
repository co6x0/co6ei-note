import { GetStaticProps, NextPage } from 'next'
import Link from 'next/link'
import Head from 'next/head'
import dayjs from 'dayjs'
import DOMPurify from 'isomorphic-dompurify'
import type { WP_REST_API_Posts } from 'wp-types'
//
import { Layout } from 'components/Layout'
import { getPosts } from 'lib/api'
import styles from 'styles/home.module.scss'

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
    <Layout>
      <Head>
        <title>co6ei note</title>
        <meta
          name="description"
          content="UI Designer, Product Manager, Web Enginnerなどとしての仕事をするKomura Nao(小村奈央)による、デザインや開発やその他自分の興味のあることなどを記すブログ。"
        />
      </Head>

      <section className={styles.root}>
        <h1>co6ei note</h1>
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
    </Layout>
  )
}
export default Home
