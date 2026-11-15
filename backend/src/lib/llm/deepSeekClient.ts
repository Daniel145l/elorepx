import type { LlmClient } from './types.js'

const DEEPSEEK_MODEL = 'deepseek-flash'

export const deepseekClient: LlmClient = {
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
        signal: AbortSignal.timeout(60_000),
        model: DEEPSEEK_MODEL,
        messages: [{ role: 'user', content: prompt }],
        thinking: { type: 'disabled' },
        temperature: 0.3,
        max_tokens: 2000,
        stream: false,
      }),
    })

    if (!response.ok) {
      const erro = await response.text()
      throw new Error(`DeepSeek API respondeu com ${response.status}: ${erro}`)
    }

    const data = await response.json()
    const choice = data.choices[0]
    const texto = choice.message?.content?.trim()
    if (!texto || choice.finish_reason === 'length') {
      throw new Error(`Resposta inválida do modelo (finish_reason=${choice.finish_reason}, tokens=${data.usage?.completion_tokens})`)
    }
    return texto
  },
}