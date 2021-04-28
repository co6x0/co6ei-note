import Image from 'next/image'

type TestProps = {
  src: string
  alt: string
  width: number
  height: number
}

export const ArticleImage: React.VFC<TestProps> = ({
  src,
  width,
  height,
  alt,
}) => {
  return src.startsWith('https://cms.sixaxd.com') ? (
    <Image src={src} width={width} height={height} alt={alt} />
  ) : (
    <img src={src} width={width} height={height} alt={alt} />
  )
}
