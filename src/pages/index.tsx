import { getPostExcerpts, getCategories } from 'lib/api'
import styles from 'styles/home.module.scss'
import { HtmlHead } from 'components/HtmlHead'
import { PostCard } from 'components/PostCard'
import { SideNav } from 'components/SideNav'
import type { NextPage, InferGetStaticPropsType } from 'next'

type Props = InferGetStaticPropsType<typeof getStaticProps>

export const getStaticProps = async () => {
  const postExcerpts = await getPostExcerpts()
  const categories = await getCategories()
  return {
    props: {
      postExcerpts,
      categories,
    },
    revalidate: 1,
  }
}

const Home: NextPage<Props> = ({ postExcerpts, categories }) => {
  return (
    <>
      <HtmlHead
        title="co6ei note"
        description="UI Designer, Product Manager, Web Engineerなどとしての仕事をするKomura Nao(小村奈央)による、デザインや開発やその他自分の興味のあることなどを記すブログ。"
        path="/"
      />

      <section className={styles.root}>
        <ul>
          {postExcerpts.map(({ id, title, excerpt, date }) => (
            <li key={id}>
              <PostCard
                href={`/posts/${id}`}
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
