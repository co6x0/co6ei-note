import fs from 'fs'
import { getPosts, getCategories } from 'lib/wpApi'
import type { GetServerSidePropsContext } from 'next'

export const getServerSideProps = async ({
  res,
}: GetServerSidePropsContext) => {
  const baseUrl = `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}`

  const pagesManifest = JSON.parse(
    fs.readFileSync('.next/server/pages-manifest.json', 'utf8')
  )
  const allStaticPages = Object.keys(pagesManifest)
  const excludePages = [
    '/',
    '/_app',
    '/_document',
    '/_error',
    '/404',
    '/500',
    '/api/getOgp',
    '/sitemap.xml',
    // ダイナミックルートは静的ファイルとは別で取得する
    '/posts/[id]',
    '/categories/[id]',
  ]

  const staticPages = allStaticPages
    .map((page) => {
      if (excludePages.includes(page)) return
      return page
    })
    .filter((page) => page) // undefinedを除外する

  const posts = await getPosts()
  const categories = await getCategories()

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>
      ${staticPages
        .map((path) => {
          return `
            <url>
              <loc>${baseUrl}${path}</loc>
              <changefreq>yearly</changefreq>
              <priority>0.2</priority>
            </url>
          `
        })
        .join('')}
      ${posts
        .map((post) => {
          return `
            <url>
              <loc>${baseUrl}/posts/${post.id}</loc>
              <lastmod>${new Date(post.modified).toISOString()}</lastmod>
              <changefreq>yearly</changefreq>
              <priority>1.0</priority>
            </url>
          `
        })
        .join('')}
      ${categories
        .map((category) => {
          return `
              <url>
                <loc>${baseUrl}/categories/${category.id}</loc>
                <changefreq>monthly</changefreq>
                <priority>0.5</priority>
              </url>
            `
        })
        .join('')}
    </urlset>
  `

  res.statusCode = 200
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

const Page = () => null
export default Page
