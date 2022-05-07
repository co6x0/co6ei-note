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

export type { Post }
