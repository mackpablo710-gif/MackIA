import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateImage(prompt: string, size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024'): Promise<string> {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size,
    quality: 'hd',
    style: 'vivid',
  })

  return response.data[0]?.url ?? ''
}

export function mapDimensionsToSize(dimensions: string): '1024x1024' | '1792x1024' | '1024x1792' {
  if (dimensions === '9:16') return '1024x1792'
  if (dimensions === '16:9' || dimensions === '1.91:1') return '1792x1024'
  return '1024x1024'
}
