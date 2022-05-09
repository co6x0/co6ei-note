import { createElement } from 'react'
import { useRouter } from 'next/router'
//
import unified from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
const rehypeHighlight = require('rehype-highlight')
import DOMPurify from 'isomorphic-dompurify'
import 'highlight.js/styles/a11y-dark.css'
import { getPostSlugs, getPostBySlug } from 'lib/api'
import { markdownToHtml } from 'lib/markdownToHtml'
import { HtmlHead } from 'components/HtmlHead'
import { ArticleLink } from 'components/ArticleLink'
import { ShareButtons } from 'components/ShareButtons'
import { SideNav } from 'components/SideNav'
import { PostDate } from 'components/PostDate'
import styles from 'styles/postId.module.scss'
//
import type {
  GetStaticPaths,
  GetStaticProps,
  NextPage,
  InferGetStaticPropsType,
} from 'next'
import type { ResultGetPost } from 'lib/api'

type Props = InferGetStaticPropsType<typeof getStaticProps>

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getPostSlugs().map((slug) => {
    return { params: { id: slug } }
  })

  return {
    paths,
    fallback: false,
  }
}

// 本来であればgetStaticPropsの返す型は`InferGetStaticPropsType<typeof getStaticProps>`で推論できると思われるが、
// 推論に任せると{[key: string]: any}を返してくるので、postFieldsに記事に必要なプロパティをまとめて、これをResultGetPostに渡した型をGetStaticPropsに教えている
/**
 * @field (keyof Post)[]
 */
const postFields = [
  'title',
  'excerpt',
  'date',
  'categories',
  'tags',
  'coverImage',
  'slug',
  'content',
] as const

export const getStaticProps: GetStaticProps<{
  postData: ResultGetPost<typeof postFields>
  content: string
}> = async ({ params }) => {
  if (params?.id === undefined) {
    return {
      notFound: true,
    }
  }

  const postId = String(params.id)
  const postData = getPostBySlug(postId, postFields)

  if (postData === undefined) {
    return {
      notFound: true,
    }
  }

  const content = await markdownToHtml(postData.content)

  // TODO:
  // if ('移行前のブログの記事IDなら') {
  //   return {
  //     redirect: {
  //       destination: `/${'新しい記事のID'}`,
  //       permanent: true
  //     }
  //   }
  // }

  return {
    props: {
      postData,
      content,
    },
  }
}

const Post: NextPage<Props> = ({ postData, content }) => {
  const router = useRouter()
  const htmlPostData = DOMPurify.sanitize(content)
  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeHighlight)
    .use(rehypeReact, {
      createElement,
      components: {
        a: (props: any) => <ArticleLink {...props} />,
      },
    })

  return (
    <div className={styles.root}>
      <HtmlHead
        title={postData.title}
        description={postData.excerpt}
        path={router.asPath}
        // imageSrc={
        //   featuredImage
        //     ? featuredImage.guid.rendered
        //     : `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}/images/default-cover-image.png`
        // }
      />

      <article>
        {/* <CoverImage /> */}
        <h1>{postData.title}</h1>
        <div className={styles['head-bottom']}>
          <PostDate dateString={postData.date} />
          <ShareButtons title={postData.title} path={router.asPath} />
        </div>
        <main className={styles['article-body']}>
          <>{processor.processSync(htmlPostData).result}</>
        </main>
      </article>

      {/* <SideNav categories={categories} /> */}
    </div>
  )
}

export default Post
