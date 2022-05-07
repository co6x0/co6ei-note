type PostType = {
  slug: string
  title: string
  date: string
  content: string
  tags?: string[]
  categories?: string[]
  coverImage?: string
  excerpt?: string
  ogImage?: {
    url: string
  }
}

export type { PostType }
