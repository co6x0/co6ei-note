import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'

export const middleware = (req: NextRequest, ev: NextFetchEvent) => {
  console.log('hello')

  // https://nextjs.org/docs/messages/middleware-relative-urls
  const url = req.nextUrl.clone()
  url.pathname = '/'

  const result = false

  if (result) {
    const res = NextResponse.redirect(url)
    return res
  }
}
