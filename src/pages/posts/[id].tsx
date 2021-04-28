import Head from 'next/head'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { Layout } from 'components/Layout'
import { getPosts, getPost } from 'lib/api'
import type { WP_REST_API_Post } from 'wp-types'

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getPosts()
  const paths = (await posts).map(({ id }) => {
    return { params: { id: String(id) } }
  })

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postId = Number(params?.id)
  const postData = await getPost(postId)

  return {
    props: {
      postData,
    },
    revalidate: 1,
  }
}

const Post: NextPage<{ postData: WP_REST_API_Post }> = ({ postData }) => {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  const convertDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD')
  }

  return (
    <Layout>
      <Head>
        <title>{postData.title.rendered}</title>
      </Head>

      <article>
        <h1>{postData.title.rendered}</h1>
        <time>{convertDate(postData.date)}</time>
        <hr />
        <main dangerouslySetInnerHTML={{ __html: postData.content.rendered }} />
      </article>
    </Layout>
  )
}

export default Post
