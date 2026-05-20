import https from 'https'
import http from 'http'

const MAX_RETRIES = 3

// Map ratio or pixel dimensions to actual pixel values
function parseDimensions(dimensions: string): { width: number; height: number } {
  // Format "1080x1920" — direct pixel spec
  if (dimensions.includes('x')) {
    const parts = dimensions.split('x')
    const w = parseInt(parts[0]) || 1024
    const h = parseInt(parts[1]) || 1024
    // Scale down if > 1024 (Pollinations limit)
    const scale = Math.min(1, 1024 / Math.max(w, h))
    return { width: Math.round(w * scale), height: Math.round(h * scale) }
  }
  // Ratio format
  switch (dimensions) {
    case '9:16':   return { width: 576, height: 1024 }
    case '4:5':    return { width: 820, height: 1024 }
    case '1.91:1': return { width: 1024, height: 536 }
    case '16:9':   return { width: 1024, height: 576 }
    case '1:1':    return { width: 1024, height: 1024 }
    default:       return { width: 1024, height: 1024 }
  }
}

export async function generateImageBuffer(prompt: string, dimensions: string = '1:1'): Promise<Buffer> {
  const { width, height } = parseDimensions(dimensions)

  // Pollinations with FLUX model — keep prompt under 300 chars to avoid socket hang up
  const shortPrompt = prompt.slice(0, 300)
  const encoded = encodeURIComponent(shortPrompt)
  const seed = Math.floor(Math.random() * 999999)

  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&enhance=true`

  let lastError: Error | null = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[image] attempt ${attempt}/${MAX_RETRIES} — ${width}x${height} (${dimensions})`)
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
      // Follow redirects
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
