import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

type Props = {
  href: string
  children: string[] | undefined
}

export const ArticleLink: React.VFC<Props> = ({ href, children }) => {
  // console.log(children[0])
  const [ogpData, setOgpData] = useState<any>()
  const cmsUrl = String('https://' + process.env.NEXT_PUBLIC_CMS_DOMAIN)
  const splitBaseUrl = (href: string) => href.replace(cmsUrl, '')

  const fetcher = fetch(`http://localhost:3000/api/getOgp?url=${href}`).then(
    (res) => {
      return res.json()
    }
  )
  const fetchData = async () => {
    const res = await fetcher
    setOgpData(res)
  }

  useEffect(() => {
    fetchData()
  })

  return href.startsWith(cmsUrl) ? (
    <Link href={splitBaseUrl(href)}>
      {children !== undefined ? children[0] : ''}
    </Link>
  ) : (
    <a href={href}>
      {/* <a href={href}>{children !== undefined ? children[0] : ''}</a> */}
      {ogpData?.title === undefined && (
        <p>{children !== undefined ? children[0] : ''}</p>
      )}
      {ogpData?.image && <img src={ogpData.image} alt="" />}
      <p>{ogpData ? ogpData.title : ''}</p>
      <p>{ogpData ? ogpData.description : ''}</p>
    </a>
  )
}
