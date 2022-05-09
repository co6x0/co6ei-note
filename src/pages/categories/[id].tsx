import { useRouter } from 'next/router'
import { getCategories, getCategory, getCategoryPosts } from 'lib/wpApi'
import { getPostCategories } from 'lib/api'
import { PostCard } from 'components/PostCard'
import { SideNav } from 'components/SideNav'
import styles from 'styles/categoryId.module.scss'
import type {
  GetStaticPaths,
  GetStaticProps,
  NextPage,
  InferGetStaticPropsType,
} from 'next'
import type { PostCategory } from 'types/post'

type Props = InferGetStaticPropsType<typeof getStaticProps>

export const getStaticPaths: GetStaticPaths = async () => {
  const categories = getPostCategories()
  const paths = categories.map(({ slug }) => {
    return { params: { id: slug } }
  })

  console.log(paths)

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<{
  categories: PostCategory[]
  currentCategory: PostCategory
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
  // const categoryData = await getCategory(categoryId)
  // const posts = await getCategoryPosts(categoryId)

  return {
    props: {
      categories,
      currentCategory,
      // categoryData,
      // posts,
    },
  }
}

const Category: NextPage<Props> = ({ categories, currentCategory }) => {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return (
    <div className={styles.root}>
      <section>
        <div className={styles.head}>
          <h1>Category: {currentCategory.name}</h1>
        </div>
        {/* <ul className={styles.posts}>
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
        </ul> */}
      </section>
      <SideNav categories={categories} />
    </div>
  )
}

export default Category
