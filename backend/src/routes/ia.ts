import { Router } from 'express'
import { llmClient } from '../lib/llm/index.js'
import { TEMAS_COTIDIANO } from '../lib/temas/temas.js'
import { aiRateLimit } from '../middleware/aiRateLimit.js'
import { requireAuth } from '../middleware/requireAuth.js'

const TEMAS_VALIDOS = new Set<string>(TEMAS_COTIDIANO)

export const iaRouter = Router()
iaRouter.use(requireAuth, aiRateLimit)

iaRouter.post('/curiosidade', async(req, res) => {
  const { tema } = req.body ?? {}

  if (typeof tema !== 'string' || !TEMAS_VALIDOS.has(tema)) {
    return res.status(400).json({ error: 'Tema inválido' })
  }

  try {
    const prompt = `Explique de forma simples e envolvente, para um estudante de ensino fundamental/médio, a seguinte curiosidade científica do cotidiano: "${tema}". Máximo 3 parágrafos curtos.`

    const curiosidade = await llmClient.gerarTexto(prompt)
    res.json({ curiosidade })
  } catch(err) {
    console.error('[ia/curiosidade] erro ao chamar LLM:', err)
    res.status(502).json({ error: 'Falha ao gerar curiosidade. Tente novamente.' })
  }
})