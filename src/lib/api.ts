/**
 * original source: https://github.com/vercel/next.js/blob/canary/examples/blog-starter-typescript/lib/api.ts
 */
import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import type { Post } from 'types/post'

type PartialPost = Partial<Post>
type PostProps = (keyof Post)[]

const postsDirectory = join(process.cwd(), 'src', '_posts')
/**
 * _postsディレクトリ内のフォルダ名(YYYY-MM-DD)からハイフンを除いた文字配列を返す
 * @returns string[] | YYYYMMDD
 */
export const getPostSlugs = () => {
  const directoryNames = fs.readdirSync(postsDirectory)
  const slugs = directoryNames.map((directoryName) => {
    return directoryName.replace(/-/g, '')
  })
  return slugs
}

/**
 * @param slug getPostSlugs()から得た配列の内のひとつ
 * @param fields 呼び出し元で必要なだけのPostのプロパティを列挙する配列
 */
export const getPostBySlug = (slug: string, fields: PostProps) => {
  // 取り除かれたハイフンを再結合してディレクトリ名を導く
  if (slug.length !== 10) return null
  const directoryName = [
    slug.slice(0, 4),
    '-',
    slug.slice(4, 6),
    '-',
    slug.slice(6, 8),
    '-',
    slug.slice(8, 10),
  ].join('')

  const fullPath = join(postsDirectory, directoryName, 'index.md')
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  // PostTypeのrequiredなプロパティが存在するか確認し、存在しなければnullを返す
  const hasRequiredKeys = (data: Record<string, any>) => {
    return data.hasOwnProperty('title') && data.hasOwnProperty('date')
  }
  if (!hasRequiredKeys(data)) return null

  const excerpt = content.replace(/\r?\n/g, '').slice(0, 120).concat(' …')
  const post: PartialPost = {}

  for (const field of fields) {
    if (field === 'slug') {
      post[field] = slug
      continue
    }
    if (field === 'excerpt') {
      post[field] = excerpt
      continue
    }
    if (data.hasOwnProperty(field)) {
      post[field] = data[field]
      continue
    }
  }

  return post
}

export const getAllPosts = (fields: PostProps = []) => {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    .filter((post): post is NonNullable<typeof post> => post != null)
    // sort posts by date in descending order
    .sort((postA, postB) => {
      const dateA = postA?.date ?? 0
      const dateB = postB?.date ?? 0
      return dateA > dateB ? -1 : 1
    })
  return posts
}
