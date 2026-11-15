import { Router } from 'express'
import { llmClient } from '../lib/llm/index.js'
import { aiRateLimit } from '../middleware/aiRateLimit.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const iaRouter = Router()
iaRouter.use(requireAuth, aiRateLimit)

iaRouter.post('/curiosidade', async(req, res) => {
  const { tema } = req.body ?? {}

  if (typeof tema !== 'string' || tema.trim().length === 0 || tema.length > 3000) {
    return res.status(400).json({ error: 'Tema inválido' })
  }

  try {
    const prompt = `Você é um divulgador científico para estudantes de ensino fundamental e médio. A questão de olimpíada abaixo é apenas o ponto de partida. Identifique o conceito científico central e explique, em linguagem simples e em até 3 parágrafos curtos, onde ele aparece no cotidiano.Não comente a questão, as alternativas nem estratégias de prova. Responda em texto simples, sem formatação Markdown. Assunto e questão: ${tema}`

    const curiosidade = await llmClient.gerarTexto(prompt)
    res.json({ curiosidade })
  } catch(err) {
    console.error('[ia/curiosidade] erro ao chamar LLM:', err)
    res.status(502).json({ error: 'Falha ao gerar curiosidade. Tente novamente.' })
  }
})