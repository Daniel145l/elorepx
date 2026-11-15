import type { LlmClient } from "./types.js";

const GEMINI_MODEL = 'gemini-3.1-flash-lite'

export const geminiClient: LlmClient = {
  async gerarTexto(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY
    if(!apiKey) throw new Error('GEMINI_API_KEY não definida em backend .env')
    
    const response = await fetch( `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 
          'content-type': 'application/json'
        },
        signal: AbortSignal.timeout(60_000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }]}],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
          }
        }),
      }
    )

    if(!response.ok) {
      const erro = await response.text()
      throw new Error(`Gemini API respondeu com ${response.status}: ${erro}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  },
}