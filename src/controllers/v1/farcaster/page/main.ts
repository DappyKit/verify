import { getPublicUrl } from '../utils/url'
import { getPage } from '../utils/page'

export default function main(): string {
  const previewImage = getPublicUrl(`static/main.jpg?1`)
  const content = `
    <meta property="frame:owner" content="354669"/>
    <meta property="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="${previewImage}">
    <meta name="og:image" content="${previewImage}">
    <meta name="fc:frame:button:1" content="🚀 Deploy + Verify">
    `

  return getPage(content)
}
