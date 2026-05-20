import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-flash-latest']

function buildModel(modelName: string, maxTokens: number) {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.8,
      maxOutputTokens: maxTokens,
    },
  })
}

async function tryModel(modelName: string, parts: object[], maxTokens: number): Promise<string> {
  const model = buildModel(modelName, maxTokens)
  const result = await model.generateContent(parts as Parameters<typeof model.generateContent>[0])
  return result.response.text()
}

export async function geminiCompletion(
  systemPrompt: string,
  userMessage = 'Procede.',
  maxTokens = 16000
): Promise<string> {
  let lastError: Error | null = null
  for (const modelName of MODELS) {
    try {
      console.log(`[gemini] trying ${modelName}`)
      const raw = await tryModel(modelName, [{ text: systemPrompt }, { text: userMessage }], maxTokens)
      return raw
    } catch (err) {
      lastError = err as Error
      const msg = lastError.message
      if (msg.includes('503') || msg.includes('overloaded') || msg.includes('high demand')) {
        console.warn(`[gemini] ${modelName} overloaded, trying next...`)
        await new Promise(r => setTimeout(r, 1500))
        continue
      }
      throw err
    }
  }
  throw lastError ?? new Error('All Gemini models failed')
}

export async function geminiVision(
  prompt: string,
  imageBase64: string,
  mimeType: string,
  maxTokens = 4000
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json', temperature: 0.5, maxOutputTokens: maxTokens },
  })
  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { data: imageBase64, mimeType } },
  ])
  return result.response.text()
}

export function parseJSONResponse<T>(response: string): T {
  let cleaned = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  const openBraces = (cleaned.match(/\{/g) || []).length
  const closeBraces = (cleaned.match(/\}/g) || []).length
  const openBrackets = (cleaned.match(/\[/g) || []).length
  const closeBrackets = (cleaned.match(/\]/g) || []).length

  for (let i = 0; i < openBrackets - closeBrackets; i++) cleaned += ']'
  for (let i = 0; i < openBraces - closeBraces; i++) cleaned += '}'

  return JSON.parse(cleaned) as T
}

export async function generateWithAI<T>(
  systemPrompt: string,
  userMessage?: string,
  maxTokens = 16000
): Promise<T> {
  const raw = await geminiCompletion(systemPrompt, userMessage, maxTokens)
  return parseJSONResponse<T>(raw)
}

export async function generateWithVision<T>(
  prompt: string,
  imageBase64: string,
  mimeType: string
): Promise<T> {
  const raw = await geminiVision(prompt, imageBase64, mimeType)
  return parseJSONResponse<T>(raw)
}
