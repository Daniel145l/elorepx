import { deepseekClient } from './deepSeekClient.js'
import { geminiClient } from './geminiClient.js'
import type { LlmClient } from './types.js'

const provedor = process.env.LLM_PROVIDER ?? 'deepseek'

const clientesDisponiveis: Record<string, LlmClient> = {
  deepseek: deepseekClient,
  gemini: geminiClient
}

const llmClient = clientesDisponiveis[provedor]

if(!llmClient) {
  throw new Error(`LLM_PROVIDER "${provedor}" não reconhecido. Use: ${Object.keys(clientesDisponiveis).join(', ')}`)
}

export { llmClient }

