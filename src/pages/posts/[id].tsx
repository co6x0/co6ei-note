import { createElement } from 'react'
import Head from 'next/head'
import dayjs from 'dayjs'
import unified from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import DOMPurify from 'isomorphic-dompurify'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { Layout } from 'components/Layout'
import { ArticleImage } from 'components/ArticleImage'
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

  const htmlPostData = DOMPurify.sanitize(postData.content.rendered)
  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeReact, {
      createElement,
      components: {
        img: (props: any) => <ArticleImage {...props} />,
      },
    })

  return (
    <Layout>
      <Head>
        <title>{postData.title.rendered}</title>
      </Head>

      <article>
        <h1>{postData.title.rendered}</h1>
        <time>{convertDate(postData.date)}</time>
        <hr />
        {processor.processSync(htmlPostData).result}
      </article>
    </Layout>
  )
}

export default Post
