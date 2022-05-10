---
title: "Next.jsで静的なページを含めて動的にサイトマップを生成する"
date: "2021-08-20"
categories: 
  - "Development"
tags: 
  - "Next.js"
---

サイトマップをビルド時に生成するとか動的に生成するみたいな例は多いのですが、静的なページがたくさんある場合だとページを1つづつ列挙するのも面倒だなとなりました。

ブログだったらISRじゃなくて、SSGに寄せても良いような気がするのでその場合は、以下のようなビルド時にサイトマップを生成するタイプのパッケージを使用するのが手っ取り早いです。

[](https://github.com/iamvishnusankar/next-sitemap)

いやどうもこのパッケージは動的なサイトマップも一緒に生成できるようなので、サイトマップが複数個になることが許容できるようであれば全部それで済ませられるかも。Google Search Consoleよく分からないのですが、複数個登録できたりするんですかね。

さて、この記事の存在意義が危ぶまれますが、pages直下に `sitemap.xml.tsx` を追加します。

```typescript
import fs from 'fs'
import { getPosts, getCategories } from 'lib/api'
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
    '/sitemap.xml',
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
```

Next.jsが生成する `.next/server/pages-manifest.json` にはpages以下のページ群が以下のような形式で保存されています。これを利用して静的なページのパスを取得しています。

サイトマップに追加したくないページは `excludePages` に追加して除外している感じですね。

```json
{
  "/": "pages/index.js",
  "/_app": "pages/_app.js",
  "/_document": "pages/_document.js",
  "/categories/[id]": "pages/categories/[id].js",
  "/posts/[id]": "pages/posts/[id].js",
  "/sitemap.xml": "pages/sitemap.xml.js",
  "/_error": "pages/_error.js",
  "/404": "pages/404.html"
}
```

また、sitemap.xmlのXMLタグの内、 `<lastmod>` は正しく設定するのが難しいので記事以外は設定していないです。

[sitemap.org](https://www.sitemaps.org/ja/protocol.html) によれば、`<urlset>` と `<url>` と `<loc>` 以外のタグはオプションのようなので、変にペナルティとか受けるなら無理に設定しなくて良いのではと思います。（ペナルティとか言うならそもそもsitemapって必要なの的な気持ち）
