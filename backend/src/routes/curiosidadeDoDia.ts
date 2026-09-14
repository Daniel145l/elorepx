import { Router } from 'express'
import { llmClient } from '../lib/llm/index.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

export const curiosidadeDoDiaRouter = Router()

const TEMAS_COTIDIANO = [
  // Física
  'por que sentimos tontura ao girar',
  'como um avião consegue voar',
  'por que o ventilador dá sensação de frio',
  'como o espelho forma nosso reflexo',
  'por que uma colher parece quebrada dentro da água',
  'como funciona o cinto de segurança',
  'por que conseguimos ouvir um eco',
  'como o celular reconhece o toque na tela',
  'por que a água do banho parece mais fria quando saímos',
  'como os fones de ouvido produzem som',

  // Química
  'por que o ovo muda de cor quando cozinhamos',
  'por que a maçã escurece depois de cortada',
  'como o sabão consegue remover a gordura',
  'por que o refrigerante perde o gás depois de aberto',
  'por que o ferro enferruja',
  'por que o álcool evapora tão rapidamente',
  'por que o leite azeda',
  'por que o limão é azedo',
  'por que o pão cresce quando usamos fermento',
  'por que o fogo pode ter diferentes cores',

  // Astronomia
  'por que a Lua muda de formato',
  'por que as estrelas parecem piscar',
  'por que acontece um eclipse',
  'por que existem as estações do ano',
  'por que temos dia e noite',
  'como a Lua influencia as marés',
  'por que existem estrelas cadentes',
  'como os satélites conseguem determinar nossa localização',
  'por que os astronautas parecem flutuar no espaço',
  'como os foguetes conseguem chegar ao espaço',
]

function temaDoDia(): string {
  const diaDoAno = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return TEMAS_COTIDIANO[diaDoAno % TEMAS_COTIDIANO.length]
}

curiosidadeDoDiaRouter.get('/', async(req, res) => {
  const hoje = new Date().toISOString().slice(0, 10)

  const { data: existente } = await supabaseAdmin
    .from('curiosidade')
    .select('tema, texto')
    .eq('data', hoje)
    .maybeSingle()

  if(existente) return res.json(existente)

  try {
    const tema = temaDoDia()
    const prompt = `Explique de forma simples e envolvente, para um estudante de ensino fundamental/médio, a seguinte curiosidade científica do cotidiano: "${tema}". Máximo 3 parágrafos curtos.`
    const texto = await llmClient.gerarTexto(prompt)   // ← igual ia.ts, mesma ideia

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