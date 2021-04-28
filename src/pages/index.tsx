import { GetStaticProps, NextPage } from 'next'
import Link from 'next/link'
import Head from 'next/head'
import dayjs from 'dayjs'
import DOMPurify from 'isomorphic-dompurify'
import { Layout } from 'components/Layout'
import { getPosts } from 'lib/api'
import type { WP_REST_API_Posts } from 'wp-types'

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
        <title>Next WordPress Blog</title>
      </Head>

      <section>
        <h1>Blog</h1>
        <ul>
          {posts.map(({ id, title, excerpt, date }) => (
            <li key={id}>
              <h2>
                <Link href={`/posts/${id}`}>{title.rendered}</Link>
              </h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: htmlExcerpt(excerpt.rendered),
                }}
              />
              <time>{convertDate(date)}</time>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}
export default Home
