import { Router } from 'express'
import { llmClient } from '../lib/llm/index.js'
import { aiRateLimit } from '../middleware/aiRateLimit.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const iaRouter = Router()
iaRouter.use(requireAuth, aiRateLimit)

iaRouter.post('/explicacao', async(req, res) => {
  const { enunciado, respostaCorreta, respostaAluno, assunto } = req.body ?? {}

  if(!enunciado || !respostaCorreta || !respostaAluno || !assunto) {
    return res.status(400).json({
      error: 'campos obrigatórios: enunciado, respostaCorreta, respostaAluno, assunto',
    })
  }

  try {
    const prompt = `Você é um professor explicando ciências para um estudante de ensino fundamental/médio se preparando para olimpíadas científicas. Questão: ${enunciado}, Assunto: ${assunto}, Resposta Correta: ${respostaCorreta}, Resposta do aluno: ${respostaAluno}. Explique, em até 3 parágrafos curtos e linguagem simples, por que a resposta correta é ${respostaCorreta} sem repetir o enunciado, direto na explicação didática.`

    const explicacao = await llmClient.gerarTexto(prompt)
    res.json({ explicacao })
  } catch(err) {
    console.error('ia/explicacao: erro: ', err)
    res.status(502).json({ error: 'Falha ao gerar explicação. Tente novamente' })
  }
})

iaRouter.post('/curiosidade', async(req, res) => {
  const { tema } = req.body ?? {}

  if(!tema) {
    return res.status(400).json({ error: 'Campo obrigatório: tema' })
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