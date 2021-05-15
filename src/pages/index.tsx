import { GetStaticProps, NextPage } from 'next'
import { WP_REST_API_Posts, WP_REST_API_Categories } from 'wp-types'
//
import { getPosts, getCategories } from 'lib/api'
import styles from 'styles/home.module.scss'
import { HtmlHead } from 'components/HtmlHead'
import { PostCard } from 'components/PostCard'
import { SideNav } from 'components/SideNav'

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
        <SideNav categories={categories} />
      </section>
    </>
  )
}
export default Home
