import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

function getModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.8,
      maxOutputTokens: 8000,
    },
  })
}

export async function geminiCompletion(systemPrompt: string, userMessage: string = 'Procede.'): Promise<string> {
  const model = getModel()
  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userMessage },
  ])
  return result.response.text()
}

export async function parseJSONResponse<T>(response: string): Promise<T> {
  const cleaned = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()
  return JSON.parse(cleaned) as T
}

export async function generateWithAI<T>(systemPrompt: string, userMessage?: string): Promise<T> {
  const raw = await geminiCompletion(systemPrompt, userMessage)
  return parseJSONResponse<T>(raw)
}
