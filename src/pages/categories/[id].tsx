import { getPostCategories, getPostsByCategory } from 'lib/api'
import { PostCard } from 'components/PostCard'
import { SideNav } from 'components/SideNav'
import styles from 'styles/categoryId.module.scss'
import type {
  GetStaticPaths,
  GetStaticProps,
  NextPage,
  InferGetStaticPropsType,
} from 'next'
import type { ResultGetPost } from 'lib/api'
import type { PostCategory } from 'types/post'

type Props = InferGetStaticPropsType<typeof getStaticProps>

export const getStaticPaths: GetStaticPaths = async () => {
  const categories = getPostCategories()
  const paths = categories.map(({ slug }) => {
    return { params: { id: slug } }
  })

  return {
    paths,
    fallback: false,
  }
}

/** @field (keyof Post)[] */
const postFields = ['title', 'excerpt', 'date', 'slug'] as const

export const getStaticProps: GetStaticProps<{
  categories: PostCategory[]
  currentCategory: PostCategory
  posts: ResultGetPost<typeof postFields>[]
}> = async ({ params }) => {
  if (params?.id === undefined) {
    return {
      notFound: true,
    }
  }

  const categories = getPostCategories()
  const categorySlug = String(params.id)
  const currentCategory = categories.find(
    (category) => category.slug === categorySlug
  )

  if (currentCategory === undefined) {
    return {
      notFound: true,
    }
  }
  const posts = await getPostsByCategory(currentCategory.name, postFields)

  return {
    props: {
      categories,
      currentCategory,
      posts,
    },
  }
}

const Category: NextPage<Props> = ({ categories, currentCategory, posts }) => {
  return (
    <div className={styles.root}>
      <section>
        <div className={styles.head}>
          <h1>Category: {currentCategory.name}</h1>
        </div>
        <ul className={styles.posts}>
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
      </section>
      <SideNav categories={categories} />
    </div>
  )
}

export default Category
