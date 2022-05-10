import { VercelRequest, VercelResponse } from '@vercel/node'
import axios, { AxiosError } from 'axios'
import { JSDOM } from 'jsdom'

// todo: OgImageが相対パスで指定されている時エラーになってしまう
// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: VercelRequest, res: VercelResponse) {
  const url = getUrlParameter(req)
  if (!url) {
    errorResponse(res, 400, 'Error')
    return
  }

  const encodedUri = encodeURI(url)
  const headers = { 'User-Agent': 'bot' }

  try {
    const response = await axios.get(encodedUri, { headers: headers })
    const html = response.data
    const dom = new JSDOM(html)
    const meta = dom.window.document.head.querySelectorAll('meta')
    const originTitle = {
      originTitle: dom.window.document.head.querySelector('title')?.textContent,
    }
    const ogp = extractOgp([...meta])
    const values = Object.assign(originTitle, ogp)
    // 604800秒 = 7日
    res.setHeader('Cache-Control', 's-maxage=604800')
    res.status(200).json(values)
  } catch (e) {
    const error = e as AxiosError
    if (error.isAxiosError) {
      errorResponse(
        res,
        error.response?.status ?? 400,
        error.response?.statusText ?? 'Unknown Error'
      )
    } else {
      errorResponse(res, 400, 'Unknown Error')
    }
  }
}

function extractOgp(metaElements: HTMLMetaElement[]): object {
  const ogp = metaElements
    .filter((element: Element) => element.hasAttribute('property'))
    .reduce((previous: any, current: Element) => {
      const property = current
        .getAttribute('property')
        ?.trim()
        .replace('og:', '')
      if (!property) return
      const content = current.getAttribute('content')
      previous[property] = content
      return previous
    }, {})

  return ogp
}

function isValidUrlParameter(url: string | string[]): boolean {
  return !(url == undefined || url == null || Array.isArray(url))
}

function getUrlParameter(req: VercelRequest): string | null {
  const { url } = req.query
  if (isValidUrlParameter(url)) {
    return <string>url
  }
  return null
}

function errorResponse(
  res: VercelResponse,
  status: number,
  message: string
): void {
  res.setHeader('Cache-Control', 's-maxage=604800')
  res.status(status).json({ code: status, message: message })
}
