import type { llmClient } from './types.js'

const DEEPSEEK_MODEL = 'deepseek-flash'

export const deepseekClient: llmClient = {
  async gerarTexto(prompt: string): Promise<string> {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY não definida em backend/.env')

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
    })

    if (!response.ok) {
      const erro = await response.text()
      throw new Error(`DeepSeek API respondeu com ${response.status}: ${erro}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  },
}