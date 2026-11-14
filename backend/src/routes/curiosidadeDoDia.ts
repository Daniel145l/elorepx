import { Router } from 'express'
import { llmClient } from '../lib/llm/index.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { TEMAS_COTIDIANO } from '../lib/temas/temas.js'

export const curiosidadeDoDiaRouter = Router()

function dataDeHojeNoBrasil(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Fortaleza' })
}

function temaDoDia(): string {
  const diaDoAno = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return TEMAS_COTIDIANO[diaDoAno % TEMAS_COTIDIANO.length]
}

curiosidadeDoDiaRouter.get('/', async(req, res) => {
  const hoje = dataDeHojeNoBrasil()

  const { data: existente } = await supabaseAdmin
    .from('curiosidade_do_dia')
    .select('tema, texto')
    .eq('data', hoje)
    .maybeSingle()

  if(existente) return res.json(existente)

  try {
    const tema = temaDoDia()
    const prompt = `Explique de forma simples e envolvente, para um estudante de ensino fundamental/médio, a seguinte curiosidade científica do cotidiano: "${tema}". Máximo 3 parágrafos curtos.`
    const texto = await llmClient.gerarTexto(prompt)
    const { data: nova, error } = await supabaseAdmin
      .from('curiosidade_do_dia')
      .insert({ data: hoje, tema, texto })
      .select('tema, texto')
      .single()

    if (error) {
      const { data: jaExistente } = await supabaseAdmin
        .from('curiosidade_do_dia')
        .select('tema, texto')
        .eq('data', hoje)
        .single()
      return res.json(jaExistente)
    }

    res.json(nova)
  } catch (err) {
    console.error('[curiosidade-do-dia] erro:', err)
    res.status(502).json({ error: 'Não foi possível gerar a curiosidade de hoje.' })
  }
})