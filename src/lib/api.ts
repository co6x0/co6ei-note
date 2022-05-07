/**
 * original source: https://github.com/vercel/next.js/blob/canary/examples/blog-starter-typescript/lib/api.ts
 */
import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import type { Post } from 'types/post'

const postsDirectory = join(process.cwd(), 'src', '_posts')

/**
 * _postsディレクトリ内のMarkdownからフォルダ名(YYYY-MM-DD)を得る
 * @returns string[] | YYYY-MM-DD
 */
export const getPostSlugs = () => {
  console.log(postsDirectory)
  return fs.readdirSync(postsDirectory)
}

/**
 * @param slug getPostSlugs()から得た配列の内のひとつ
 * @param fields Postのoptionalなプロパティを列挙する配列
 */
export const getPostBySlug = (
  slug: string,
  fields: (keyof Omit<Post, 'slug' | 'title' | 'date' | 'content'>)[] = []
): Post | null => {
  const fullPath = join(postsDirectory, slug, 'index.md')
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  // PostTypeのrequiredなプロパティが存在するか確認し、存在しなければnullを返す
  const hasRequiredKeys = (data: Record<string, any>) => {
    return data.hasOwnProperty('title') && data.hasOwnProperty('date')
  }
  if (!hasRequiredKeys(data)) return null

  const post: Post = {
    slug: slug,
    title: data.title,
    date: data.date,
    content: content,
  }

  for (const field of fields) {
    if (!data.hasOwnProperty(field)) continue
    post[field] = data[field]
  }

  return post
}

export function getAllPosts(fields: string[] = []) {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
  return posts
}
