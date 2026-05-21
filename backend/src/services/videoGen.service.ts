import https from 'https'
import http from 'http'

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string | string[]
  error?: string
  urls?: { get: string; cancel: string }
}

async function jsonRequest(method: 'GET' | 'POST', url: string, body?: object): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        'Authorization': `Bearer ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
    const client = url.startsWith('https') ? https : http
    const req = client.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch { resolve(data) }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function pollPrediction(predId: string, maxWaitMs = 180_000): Promise<string> {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    await new Promise(r => setTimeout(r, 4000))
    const pred = await jsonRequest('GET', `https://api.replicate.com/v1/predictions/${predId}`) as ReplicatePrediction
    if (pred.status === 'succeeded') {
      const out = Array.isArray(pred.output) ? pred.output[0] : pred.output
      if (!out) throw new Error('No output in prediction')
      return out as string
    }
    if (pred.status === 'failed' || pred.status === 'canceled') {
      throw new Error(`Prediction ${pred.status}: ${pred.error ?? 'unknown'}`)
    }
    console.log(`[video-gen] polling ${predId} — status: ${pred.status}`)
  }
  throw new Error('Video generation timed out after 3 minutes')
}

/**
 * Generate a short video using Kling 1.5 Pro via Replicate
 * Returns a public URL to the video file
 */
export async function generateVideoWithReplicate(
  prompt: string,
  duration: 5 | 10 = 5,
  aspectRatio: '9:16' | '16:9' | '1:1' = '9:16'
): Promise<string> {
  if (!REPLICATE_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not configured. Add it to your .env file.')
  }

  console.log('[video-gen] starting Kling video generation...')
  console.log('[video-gen] prompt:', prompt.slice(0, 100))

  // Use Kling 1.5 Pro model (best quality motion with realistic people)
  const pred = await jsonRequest('POST', 'https://api.replicate.com/v1/models/kwaivgi/kling-v1-5-pro/predictions', {
    input: {
      prompt: prompt.slice(0, 2500),
      negative_prompt: 'low quality, blurry, static, no motion, watermark, text overlay',
      duration,
      aspect_ratio: aspectRatio,
      cfg_scale: 0.5,
    },
  }) as ReplicatePrediction

  if (!pred.id) throw new Error('Failed to create Replicate prediction: ' + JSON.stringify(pred))
  console.log('[video-gen] prediction created:', pred.id)

  const videoUrl = await pollPrediction(pred.id)
  console.log('[video-gen] video ready:', videoUrl)
  return videoUrl
}

/**
 * Download a video from URL and return as Buffer
 */
export async function downloadVideoBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, { timeout: 120_000 }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadVideoBuffer(res.headers.location).then(resolve).catch(reject)
        return
      }
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode}`))
        return
      }
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Download timed out')) })
  })
}
