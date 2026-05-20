import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function chatCompletion(systemPrompt: string, userMessage: string = 'Procede.'): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.8,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  })

  return completion.choices[0]?.message?.content ?? ''
}

export async function parseJSONResponse<T>(response: string): Promise<T> {
  const cleaned = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  return JSON.parse(cleaned) as T
}

export async function generateWithOpenAI<T>(systemPrompt: string, userMessage?: string): Promise<T> {
  const raw = await chatCompletion(systemPrompt, userMessage)
  return parseJSONResponse<T>(raw)
}

export async function streamCompletion(
  systemPrompt: string,
  onChunk: (chunk: string) => void,
  userMessage: string = 'Procede.'
): Promise<void> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.8,
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) onChunk(content)
  }
}
