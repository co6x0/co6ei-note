import { GetStaticProps, NextPage } from 'next'
import Link from 'next/link'
import Head from 'next/head'
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
                <Link href={`/posts/${id}`}>
                  <a>{title.rendered}</a>
                </Link>
              </h2>
              <p>{excerpt.rendered}</p>
              <time>{date}</time>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}
export default Home
