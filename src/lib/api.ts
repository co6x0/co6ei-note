import WPAPI from 'wpapi'
import type { WP_REST_API_Posts, WP_REST_API_Post } from 'wp-types'

const wp = new WPAPI({ endpoint: String(process.env.WPAPI_ENDPOINT) })
export const getPosts = async () => {
  const posts: WP_REST_API_Posts = await wp
    .posts()
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
