import { createElement } from 'react'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'
//
import dayjs from 'dayjs'
import unified from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
const rehypeHighlight = require('rehype-highlight')
import DOMPurify from 'isomorphic-dompurify'
import 'highlight.js/styles/a11y-dark.css'
import { WP_REST_API_Post, WP_REST_API_Attachment } from 'wp-types'
//
import { HtmlHead } from 'components/HtmlHead'
import { ArticleLink } from 'components/ArticleLink'
import { ShareButtons } from 'components/ShareButtons'
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
        a: (props: any) => <ArticleLink {...props} />,
      },
    })

  const CoverImage = () => {
    type MediaDetailsProps = {
      sizes: {
        full: {
          source_url: string
          width: number
          height: number
        }
        large: {
          source_url: string
          width: number
          height: number
        }
        medium_large: {
          source_url: string
          width: number
          height: number
        }
      }
    }

    if (!featuredImage) return <></>

    const mediaDetails = featuredImage.media_details as MediaDetailsProps
    const getFormatImage = (size: 'full' | 'large' | 'medium_large') => {
      return {
        source_url: mediaDetails.sizes[size].source_url,
        width: mediaDetails.sizes[size].width,
        height: mediaDetails.sizes[size].height,
      }
    }

    const imageFull = getFormatImage('full')
    const imageLarge = getFormatImage('large')
    const imageMedium = getFormatImage('medium_large')

    return (
      <div className={styles['featured-image']}>
        <img
          sizes="(max-width: 600px) 600px, 720px"
          srcSet={`
            ${imageFull.source_url} ${imageFull.width}w,
            ${imageLarge.source_url} ${imageLarge.width}w,
            ${imageMedium.source_url} ${imageMedium.width}w
          `}
          src={imageFull.source_url}
          width={imageFull.width}
          height={imageFull.height}
          alt={`${postData.title.rendered}のアイキャッチ画像`}
        />
      </div>
    )
  }

  return (
    <>
      <HtmlHead
        title={postData.title.rendered}
        description={strippedHtmlExcerpt}
        path={router.asPath}
        imageSrc={
          featuredImage
            ? featuredImage.guid.rendered
            : `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}/images/default-cover-image.png`
        }
      />

      <article className={styles.root}>
        <CoverImage />
        <h1>{postData.title.rendered}</h1>
        <div className={styles['head-bottom']}>
          <time>{convertDate(postData.date)}</time>
          <ShareButtons title={postData.title.rendered} path={router.asPath} />
        </div>
        <main className={styles['article-body']}>
          <>{processor.processSync(htmlPostData).result}</>
        </main>
      </article>
    </>
  )
}

export default Post
