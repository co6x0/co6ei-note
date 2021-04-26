import WPAPI from 'wpapi'
import type { WP_REST_API_Posts } from 'wp-types'

const wp = new WPAPI({ endpoint: 'http://35.187.216.147/wp-json' })
export const getPosts = async () => {
  const posts: WP_REST_API_Posts = await wp
    .posts()
    .get()
    .catch((error) => {
      throw new Error(error)
    })
  return posts
}
