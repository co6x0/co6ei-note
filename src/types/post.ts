type PostType = {
  slug: string
  title: string
  date: string
  content: string
  coverImage?: string
  excerpt?: string
  ogImage?: {
    url: string
  }
}

export default PostType
