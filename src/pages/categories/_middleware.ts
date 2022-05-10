import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  console.log('Hello')

  const response = NextResponse.next()

  const oldCategorySlugs = ['1', '2', '9', '16']

  // https://nextjs.org/docs/messages/middleware-relative-urls
  const url = req.nextUrl.clone()
  const pathname = url.pathname
  const categorySlug = url.pathname.slice(
    pathname.lastIndexOf('/') + 1,
    pathname.length
  )
  const isOldSlug = oldCategorySlugs.includes(categorySlug)

  console.log(categorySlug, pathname)

  if (isOldSlug) {
    const convertCurrentPath = (oldSlug: string) => {
      switch (oldSlug) {
        case '1':
          return '/categories/uncategorized'
        case '2':
          return '/categories/development'
        case '9':
          return '/categories/design'
        case '16':
          return '/categories/music'
        default:
          return '/'
      }
    }
    url.pathname = convertCurrentPath(categorySlug)
    return NextResponse.redirect(url, 308)
  }

  return response
}
