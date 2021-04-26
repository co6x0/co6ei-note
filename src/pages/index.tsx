import { getPosts } from 'repositories/wordpress'
import { GetStaticProps, NextPage } from 'next'
import type { WP_REST_API_Posts } from 'wp-types'

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getPosts()
  return {
    props: {
      posts,
    },
  }
}

const Home: NextPage<{ posts: WP_REST_API_Posts }> = ({ posts }) => {
  console.log(posts)
  return (
    <div>
      <section>
        <h2>Blog</h2>
        <ul>
          {posts.map(({ id, title, excerpt, date }) => (
            <li key={id}>
              <strong>{title.rendered}</strong>
              <p>{excerpt.rendered}</p>
              <time>{date}</time>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
export default Home
