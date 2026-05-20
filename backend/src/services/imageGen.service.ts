import https from 'https'
import http from 'http'

export async function generateImage(prompt: string, dimensions: string = '1:1'): Promise<string> {
  const width = dimensions === '9:16' ? 768 : dimensions === '16:9' ? 1280 : 1024
  const height = dimensions === '9:16' ? 1280 : dimensions === '16:9' ? 768 : 1024

  const encoded = encodeURIComponent(prompt)
  const seed = Math.floor(Math.random() * 999999)
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`

  // Pollinations returns the image directly — resolve the final URL after redirect
  const finalUrl = await followRedirect(url)
  return finalUrl
}

function followRedirect(url: string, maxRedirects = 5): Promise<string> {
  return new Promise((resolve, reject) => {
    if (maxRedirects === 0) return resolve(url)
    const client = url.startsWith('https') ? https : http
    client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        followRedirect(res.headers.location, maxRedirects - 1).then(resolve).catch(reject)
      } else {
        resolve(url)
      }
    }).on('error', () => resolve(url))
  })
}

export function mapDimensionsToSize(dimensions: string): string {
  return dimensions
}
