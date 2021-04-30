import Link from 'next/link'

type Props = {
  href: string
  children: string[] | undefined
}

export const ArticleLink: React.VFC<Props> = ({ href, children }) => {
  // console.log(children[0])
  const cmsUrl = String('https://' + process.env.NEXT_PUBLIC_CMS_DOMAIN)
  const splitBaseUrl = (href: string) => href.replace(cmsUrl, '')

  return href.startsWith(cmsUrl) ? (
    <Link href={splitBaseUrl(href)}>
      {children !== undefined ? children[0] : ''}
    </Link>
  ) : (
    <a href={href}>{children !== undefined ? children[0] : ''}</a>
  )
}
