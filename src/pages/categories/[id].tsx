import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import {
  WP_REST_API_Category,
  WP_REST_API_Categories,
  WP_REST_API_Posts,
} from 'wp-types'
//
import { getCategories, getCategory, getCategoryPosts } from 'lib/wpApi'
import { PostCard } from 'components/PostCard'
import { SideNav } from 'components/SideNav'
import styles from 'styles/categoryId.module.scss'

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
  const categories = await getCategories()

  return {
    props: {
      categoryData,
      posts,
      categories,
    },
  }
}

const Category: NextPage<{
  categoryData: WP_REST_API_Category
  posts: WP_REST_API_Posts
  categories: WP_REST_API_Categories
}> = ({ categoryData, posts, categories }) => {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return (
    <div className={styles.root}>
      <section>
        <div className={styles.head}>
          <h1>Category: {categoryData.name}</h1>
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
      </section>
      <SideNav categories={categories} />
    </div>
  )
}

export default Category
