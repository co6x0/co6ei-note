import { getCategories } from 'lib/wpApi'
import { getAllPosts } from 'lib/api'
import styles from 'styles/home.module.scss'
import { HtmlHead } from 'components/HtmlHead'
import { PostCard } from 'components/PostCard'
import { SideNav } from 'components/SideNav'
import type { NextPage, InferGetStaticPropsType } from 'next'

type Props = InferGetStaticPropsType<typeof getStaticProps>

export const getStaticProps = async () => {
  const posts = getAllPosts(['title', 'slug', 'excerpt', 'date'])
  const categories = await getCategories()

  return {
    props: {
      posts,
      categories,
    },
  }
}

const Home: NextPage<Props> = ({ posts, categories }) => {
  return (
    <>
      <HtmlHead
        title="co6ei note"
        description="UI Designer, Product Manager, Web Engineerなどとしての仕事をするKomura Nao(小村奈央)による、デザインや開発やその他自分の興味のあることなどを記すブログ。"
        path="/"
      />

      <section className={styles.root}>
        <ul>
          {posts.map(({ slug, title, excerpt, date }) => (
            <li key={slug}>
              <PostCard
                href={`/posts/${slug}`}
                title={title}
                excerpt={excerpt}
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
