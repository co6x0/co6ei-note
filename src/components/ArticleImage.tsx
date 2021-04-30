import Image from 'next/image'

type Props = {
  src: string
  alt: string
  width: number
  height: number
}

export const ArticleImage: React.VFC<Props> = ({ src, width, height, alt }) => {
  return src.startsWith(
    String('https://' + process.env.NEXT_PUBLIC_CMS_DOMAIN)
  ) ? (
    <Image src={src} width={width} height={height} alt={alt} />
  ) : (
    <img src={src} width={width} height={height} alt={alt} />
  )
}
