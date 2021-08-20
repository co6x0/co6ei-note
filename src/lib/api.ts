import WPAPI from 'wpapi'
import type {
  WP_REST_API_Posts,
  WP_REST_API_Post,
  WP_REST_API_Attachment,
  WP_REST_API_Categories,
  WP_REST_API_Category,
} from 'wp-types'

const wp = new WPAPI({
  endpoint: String(
    'https://' + process.env.NEXT_PUBLIC_CMS_DOMAIN + '/wp-json'
  ),
})
export const getPosts = async () => {
  const posts: WP_REST_API_Posts = await wp
    .posts()
    .perPage(50)
    .get()
    .catch((error) => {
      throw new Error(error)
    })
  return posts
}

export const getPost = async (id: number) => {
  const post: WP_REST_API_Post = await wp
    .posts()
    .id(id)
    .get()
    .catch((error) => {
      throw new Error(error)
    })
  return post
}

export const getMedia = async (id: number) => {
  const media: WP_REST_API_Attachment = await wp
    .media()
    .id(id)
    .get()
    .catch((error) => {
      throw new Error(error)
    })
  return media
}

export const getCategories = async () => {
  const categories: WP_REST_API_Categories = await wp
    .categories()
    .perPage(50)
    .get()
    .catch((error) => {
      throw new Error(error)
    })
  return categories
}

export const getCategory = async (id: number) => {
  const category: WP_REST_API_Category = await wp
    .categories()
    .id(id)
    .get()
    .catch((error) => {
      throw new Error(error)
    })
  return category
}

export const getCategoryPosts = async (id: number) => {
  const posts: WP_REST_API_Posts = await wp
    .posts()
    .param('categories', id)
    .perPage(50)
    .get()
    .catch((error) => {
      throw new Error(error)
    })
  return posts
}
