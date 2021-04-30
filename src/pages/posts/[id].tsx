import { createElement } from 'react'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
//
import dayjs from 'dayjs'
import unified from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
const rehypeHighlight = require('rehype-highlight')
import DOMPurify from 'isomorphic-dompurify'
import 'highlight.js/styles/a11y-dark.css'
import type { WP_REST_API_Post, WP_REST_API_Attachment } from 'wp-types'
//
import { Layout } from 'components/Layout'
import { ArticleImage } from 'components/ArticleImage'
import { ArticleLink } from 'components/ArticleLink'
import { getPosts, getPost, getMedia } from 'lib/api'
import styles from 'styles/postId.module.scss'

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

  const featuredImage = postData.featured_media
    ? await getMedia(postData.featured_media)
    : null

  return {
    props: {
      postData,
      featuredImage,
    },
    revalidate: 1,
  }
}

const Post: NextPage<{
  postData: WP_REST_API_Post
  featuredImage: WP_REST_API_Attachment | null
}> = ({ postData, featuredImage }) => {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  const convertDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD')
  }

  const strippedHtmlExcerpt = postData.excerpt.rendered
    .replace(/(<([^>]+)>)/gi, '')
    .replace(/\r?\n/g, '')
    .replace('[&hellip;]', '…')

  const htmlPostData = DOMPurify.sanitize(postData.content.rendered)
  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeHighlight)
    .use(rehypeReact, {
      createElement,
      components: {
        img: (props: any) => <ArticleImage {...props} />,
        a: (props: any) => <ArticleLink {...props} />,
      },
    })

  const CoverImage = () => {
    const src = featuredImage?.guid.rendered
    const width =
      typeof featuredImage?.media_details.width === 'number' &&
      featuredImage.media_details.width
    const height =
      typeof featuredImage?.media_details.height === 'number' &&
      featuredImage.media_details.height

    return featuredImage ? (
      <Image
        src={src || ''}
        width={width || 0}
        height={height || 0}
        alt={`${postData.title.rendered}のアイキャッチ画像`}
      />
    ) : (
      <Image
        src="/images/default-cover-image.png"
        width="1280"
        height="768"
        alt=""
      />
    )
  }

  return (
    <Layout>
      <Head>
        <title>{postData.title.rendered}｜co6ei note</title>
        {postData.excerpt && (
          <meta name="description" content={strippedHtmlExcerpt} />
        )}
      </Head>

      <article className={styles.root}>
        <CoverImage />
        <h1>{postData.title.rendered}</h1>
        <time>{convertDate(postData.date)}</time>
        <hr />
        <main className={styles['article-body']}>
          <>{processor.processSync(htmlPostData).result}</>
        </main>
      </article>
    </Layout>
  )
}

export default Post
