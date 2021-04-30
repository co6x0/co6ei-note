import Link from 'next/link'

type Props = {
  href: string
  children: string[]
}

export const ArticleLink: React.VFC<Props> = ({ href, children }) => {
  const cmsUrl = String('https://' + process.env.NEXT_PUBLIC_CMS_DOMAIN)
  const splitBaseUrl = (href: string) => href.replace(cmsUrl, '')

  return href.startsWith(cmsUrl) ? (
    <Link href={splitBaseUrl(href)}>{children[0]}</Link>
  ) : (
    <a href={href}>{children[0]}</a>
  )
}
