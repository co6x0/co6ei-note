import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { WP_REST_API_Category, WP_REST_API_Posts } from 'wp-types'
//
import { getCategories, getCategory, getCategoryPosts } from 'lib/api'
import { PostCard } from 'components/PostCard'
import styles from 'styles/categoryId.module.scss'
import ArticleIcon from 'assets/svg/description.svg'

export const getStaticPaths: GetStaticPaths = async () => {
  const categories = getCategories()
  const paths = (await categories).map(({ id }) => {
    return { params: { id: String(id) } }
  })

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const categoryId = Number(params?.id)
  const categoryData = await getCategory(categoryId)
  const posts = await getCategoryPosts(categoryId)

  return {
    props: {
      categoryData,
      posts,
    },
    revalidate: 1,
  }
}

const Category: NextPage<{
  categoryData: WP_REST_API_Category
  posts: WP_REST_API_Posts
}> = ({ categoryData, posts }) => {
  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <h1>Category: {categoryData.name}</h1>
        <div>
          <ArticleIcon title="記事数" />
          <p>{categoryData.count}</p>
        </div>
      </div>
      <ul className={styles.posts}>
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
    </div>
  )
}

export default Category
