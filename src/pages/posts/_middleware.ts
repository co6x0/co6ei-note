import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const correspondingPostSlugs = [
    { oldSlug: '188', newSlug: '2022021201' },
    { oldSlug: '181', newSlug: '2021082001' },
    { oldSlug: '174', newSlug: '2021081201' },
    { oldSlug: '161', newSlug: '2021062701' },
    { oldSlug: '110', newSlug: '2021042701' },
    { oldSlug: '112', newSlug: '2021011001' },
    { oldSlug: '102', newSlug: '2020112701' },
    { oldSlug: '94', newSlug: '2020090601' },
    { oldSlug: '76', newSlug: '2020062801' },
    { oldSlug: '75', newSlug: '2020030201' },
    { oldSlug: '74', newSlug: '2020021701' },
    { oldSlug: '73', newSlug: '2019123101' },
    { oldSlug: '72', newSlug: '2019122201' },
    { oldSlug: '71', newSlug: '2019121601' },
    { oldSlug: '70', newSlug: '2019110101' },
    { oldSlug: '69', newSlug: '2019073001' },
    { oldSlug: '67', newSlug: '2019072101' },
    { oldSlug: '68', newSlug: '2019072102' },
    { oldSlug: '66', newSlug: '2019072001' },
    { oldSlug: '63', newSlug: '2019071501' },
    { oldSlug: '65', newSlug: '2019071502' },
  ]

  // https://nextjs.org/docs/messages/middleware-relative-urls
  const url = req.nextUrl.clone()
  const pathname = url.pathname
  const postSlug = url.pathname.slice(
    pathname.lastIndexOf('/') + 1,
    pathname.length
  )
  const oldPostSlugs = correspondingPostSlugs.flatMap(
    (postSlug) => postSlug.oldSlug
  )
  const isOldSlug = oldPostSlugs.includes(postSlug)

  if (isOldSlug) {
    const convertCurrentPath = (oldSlug: string) => {
      const matchSlug = correspondingPostSlugs.find(
        (postSlug) => postSlug.oldSlug === oldSlug
      )
      return matchSlug?.newSlug ? `/posts/${matchSlug.newSlug}` : '/'
    }

    url.pathname = convertCurrentPath(postSlug)
    return NextResponse.redirect(url, 308)
  }
}
