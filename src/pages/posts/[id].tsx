import Image from 'next/image'
import { createElement } from 'react'
import { useRouter } from 'next/router'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeHighlight from 'rehype-highlight'
import DOMPurify from 'isomorphic-dompurify'
import 'highlight.js/styles/a11y-dark.css'
import { getPostSlugs, getPostBySlug, getPostCategories } from 'lib/api'
import { markdownToHtml } from 'lib/markdownToHtml'
import { HtmlHead } from 'components/HtmlHead'
import { ArticleLink } from 'components/ArticleLink'
import { ArticleImage } from 'components/ArticleImage'
import { ShareButtons } from 'components/ShareButtons'
import { SideNav } from 'components/SideNav'
import { PostDate } from 'components/PostDate'
import styles from 'styles/postId.module.scss'
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
  const paths = getPostSlugs().map((slug) => {
    return { params: { id: slug } }
  })

  return {
    paths,
    fallback: false,
  }
}

/** @field (keyof Post)[] */
const postFields = [
  'title',
  'excerpt',
  'date',
  'categories',
  'tags',
  'coverImage',
  'slug',
  'content',
  'directoryName',
] as const

export const getStaticProps: GetStaticProps<{
  postData: ResultGetPost<typeof postFields>
  content: string
  categories: PostCategory[]
}> = async ({ params }) => {
  if (params?.id === undefined) {
    return {
      notFound: true,
    }
  }

  const postId = String(params.id)
  const postData = getPostBySlug(postId, postFields)
  const categories = getPostCategories()

  if (postData === undefined) {
    return {
      notFound: true,
    }
  }
  const content = await markdownToHtml(postData.content)

  return {
    props: {
      postData,
      content,
      categories,
    },
  }
}

const Post: NextPage<Props> = ({ postData, content, categories }) => {
  const router = useRouter()
  const htmlPostData = DOMPurify.sanitize(content)
  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeHighlight)
    // @ts-ignore: なぜかpropsの型にany/unknown以外を指定できない
    .use(rehypeReact, {
      createElement,
      components: {
        a: (props: { href: string; children?: string[] }) => {
          return (
            <ArticleLink
              href={props.href}
              text={props.children ? props.children[0] : undefined}
            />
          )
        },
        img: (props: { alt?: string; src: string; children?: string[] }) => {
          const fileName = props.src.slice(
            props.src.lastIndexOf('/') + 1,
            props.src.length
          )
          const srcPath = `/images/posts/${postData.directoryName}/${fileName}`
          return (
            <ArticleImage
              src={srcPath}
              alt={props.alt}
              directoryName={postData.directoryName}
            />
          )
        },
      },
    })

  const coverImage =
    postData.coverImage &&
    `/images/posts/${postData.directoryName}/${postData.coverImage}`

  return (
    <div className={styles.root}>
      <HtmlHead
        title={postData.title}
        description={postData.excerpt}
        path={router.asPath}
        imageSrc={
          coverImage
            ? `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}/${coverImage}`
            : `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}/images/default-cover-image.png`
        }
      />

      <article>
        {coverImage && (
          <div className={styles['cover-image']}>
            <Image
              src={coverImage}
              alt={postData.title + 'のアイキャッチ画像'}
              layout="responsive"
              width={2400}
              height={1260}
              objectFit="contain"
            />
          </div>
        )}
        <h1>{postData.title}</h1>
        <div className={styles['head-bottom']}>
          <PostDate dateString={postData.date} />
          <ShareButtons title={postData.title} path={router.asPath} />
        </div>
        <main className={styles['article-body']}>
          <>{processor.processSync(htmlPostData).result}</>
        </main>
      </article>

      <SideNav categories={categories} />
    </div>
  )
}

export default Post
