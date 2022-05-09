type Post = {
  slug: string
  title: string
  date: string
  content: string
  excerpt: string
  tags?: string[]
  categories?: string[]
  coverImage?: string
  ogImage?: {
    url: string
  }
}

type PostCategory = {
  name: string
  slug: string
  count: number
}

export type { Post, PostCategory }
