type ShareData = {
  text: string
  url: string
}
type Share = {
  share(data: ShareData): Promise<void>
}

const maxTweetTextLength = 140
const tweetUrlLength = 22

const fallbackShare = ({ text, url }: ShareData) => {
  const _navigator = navigator as Navigator & Share
  const textMaxLength = maxTweetTextLength - tweetUrlLength - 1

  if (text.length > textMaxLength) {
    text = text.slice(0, textMaxLength - 1) + '…'
  }

  const ta = document.createElement('textarea')

  ta.value = `${text} ${url}`
  ta.setAttribute('style', 'display; none;')
  document.body.appendChild(ta)

  const isIOS = _navigator.userAgent.match(/ipad|ipod|iphone/i)

  if (isIOS) {
    const range = document.createRange()
    range.selectNode(ta)

    const selection = window.getSelection()
    if (selection) selection.addRange(range)
  } else {
    ta.select()
    document.execCommand('copy')
  }

  if (ta.parentNode) ta.parentNode.removeChild(ta)
  if (document.execCommand('copy')) return 'success'
  if (!document.execCommand('copy')) return 'error'
}

export const share = ({ text, url }: ShareData): void | string => {
  const _navigator = navigator as Navigator & Share

  if (!_navigator.share) return fallbackShare({ text, url })

  if (text.length > maxTweetTextLength) {
    text = text.slice(0, maxTweetTextLength - 1) + '…'
  }
  _navigator.share({ text, url })
}
