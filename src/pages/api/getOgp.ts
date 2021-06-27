import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import { JSDOM } from 'jsdom'

// todo: 毎回処理が走ってしまうのでデータをどこかに保存したい
// todo: OgImageが相対パスで指定されている時エラーになってしまう

export default async function (req: VercelRequest, res: VercelResponse) {
  const url = getUrlParameter(req)
  if (!url) {
    errorResponse(res)
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
    res.status(200).json(values)
  } catch (e) {
    errorResponse(res)
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

function errorResponse(res: VercelResponse): void {
  res.status(400).send('error')
}
