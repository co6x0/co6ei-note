import Head from 'next/head'

type Props = {
  title: string
  description: string
  path: string
  imageSrc?: string
}

export const HtmlHead: React.VFC<Props> = (props) => {
  return (
    <Head>
      <title>
        {props.title === 'co6ei note'
          ? 'co6ei note'
          : `${props.title}｜co6ei note`}
      </title>
      <meta name="description" content={props.description} />
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content={`https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}${props.path}`}
      />
      <meta property="og:title" content={`${props.title}｜co6ei note`} />
      <meta property="og:description" content={props.description} />
      <meta
        property="og:image"
        content={
          props.imageSrc
            ? props.imageSrc
            : `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}/images/default-cover-image.png`
        }
      />
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta
        property="twitter:url"
        content={`https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}${props.path}`}
      />
      <meta property="twitter:title" content={`${props.title}｜co6ei note`} />
      <meta property="twitter:description" content={props.description} />
      <meta
        property="twitter:image"
        content={
          props.imageSrc
            ? props.imageSrc
            : `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}/images/default-cover-image.png`
        }
      />
    </Head>
  )
}
