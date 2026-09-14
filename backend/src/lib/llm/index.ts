import { geminiClient } from './geminiClient.js'
import type { llmClient } from './types.js'

const provedor = process.env.LLM_PROVIDER ?? 'gemini'

const clientesDisponiveis: Record<string, llmClient> = {
  gemini: geminiClient,
}

const llmClient = clientesDisponiveis[provedor]

if(!llmClient) {
  throw new Error(`LLM_PROVIDER "${provedor}" não reconhecido. Use: ${Object.keys(clientesDisponiveis).join(', ')}`)
}

export { llmClient }

