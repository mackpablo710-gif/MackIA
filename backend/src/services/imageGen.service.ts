import https from 'https'
import http from 'http'

export async function generateImageBuffer(prompt: string, dimensions: string = '1:1'): Promise<Buffer> {
  const width = dimensions === '9:16' ? 768 : dimensions === '16:9' ? 1280 : 1024
  const height = dimensions === '9:16' ? 1280 : dimensions === '16:9' ? 768 : 1024

  const encoded = encodeURIComponent(prompt.slice(0, 1500))
  const seed = Math.floor(Math.random() * 999999)
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`

  return downloadImageAsBuffer(url)
}

function downloadImageAsBuffer(url: string, maxRedirects = 5): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (maxRedirects === 0) return reject(new Error('Too many redirects'))
    const client = url.startsWith('https') ? https : http
    client.get(url, { timeout: 60000 }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImageAsBuffer(res.headers.location, maxRedirects - 1).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Image server returned ${res.statusCode}`))
        return
      }
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}
