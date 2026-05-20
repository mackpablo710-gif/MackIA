import https from 'https'
import http from 'http'

const MAX_RETRIES = 3

export async function generateImageBuffer(prompt: string, dimensions: string = '1:1'): Promise<Buffer> {
  const width  = dimensions === '9:16' ? 768  : dimensions === '16:9' ? 1280 : 1024
  const height = dimensions === '9:16' ? 1280 : dimensions === '16:9' ? 768  : 1024

  // Pollinations con modelo FLUX — prompt máx 300 chars para evitar socket hang up
  const shortPrompt = prompt.slice(0, 300)
  const encoded = encodeURIComponent(shortPrompt)
  const seed = Math.floor(Math.random() * 999999)

  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&enhance=true`

  let lastError: Error | null = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[image] attempt ${attempt}/${MAX_RETRIES} — ${width}x${height}`)
      const buf = await downloadWithTimeout(url, 90_000)
      console.log(`[image] downloaded OK — ${buf.length} bytes`)
      return buf
    } catch (err) {
      lastError = err as Error
      console.warn(`[image] attempt ${attempt} failed: ${lastError.message}`)
      if (attempt < MAX_RETRIES) await new Promise(r => setTimeout(r, 3000 * attempt))
    }
  }
  throw lastError ?? new Error('Image generation failed after retries')
}

function downloadWithTimeout(url: string, timeoutMs: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, { timeout: timeoutMs }, (res) => {
      // Seguir redirecciones
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadWithTimeout(res.headers.location, timeoutMs).then(resolve).catch(reject)
        return
      }
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode}`))
        return
      }
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => {
        const buf = Buffer.concat(chunks)
        if (buf.length < 1000) {
          reject(new Error('Response too small — likely an error page'))
          return
        }
        resolve(buf)
      })
      res.on('error', reject)
    })
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timed out'))
    })
  })
}
