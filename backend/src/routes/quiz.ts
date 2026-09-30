import { Router } from "express"
import { llmClient } from "../lib/llm/index.js"
import { calcularNivelNarrativo } from '../lib/niveis.js'
import { supabaseAdmin } from "../lib/supabaseAdmin.js"
import { AuthenticatedRequest, requireAuth } from "../middleware/requireAuth.js"

export const quizRouter = Router()
quizRouter.use(requireAuth)

interface Questao {
  id: string
  assunto: string
  nivel_dificuldade: string
  enunciado: string
  alternativas: { id: string; texto: string }[]
  resposta_correta: string
}

quizRouter.get('/questoes', async(req, res) => {
  const { olimpiada_id, nivel_id, quantidade } = req.query
  const quantidadeNum = Math.min(Math.max(Number(quantidade) || 5, 1), 20)

  let query = supabaseAdmin
  .from('questoes')
  .select('id, assunto, enunciado, alternativas')
  .limit(quantidadeNum)

  if(olimpiada_id) query = query.eq('olimpiada_id', olimpiada_id as string)
  if(nivel_id) query = query.eq('nivel_id', nivel_id as string)

  const { data, error } = await query

  if(error) {
    console.error('[quiz/questoes] erro:', error)
    return res.status(502).json({ error: 'Não foi possível carregar as questões.' })
  }

  res.json(data)
})

  async function atualizarProgressoMissoes(userId: string, resultadosValidos: {
    assunto: string
    correta: boolean
  }[]) {
    const acertosPorAssunto: Record<string, number> = {}
    for (const r of resultadosValidos) {
      if (r.correta) {
        acertosPorAssunto[r.assunto] = (acertosPorAssunto[r.assunto] ?? 0) + 1
      }
    }

    const assuntosComAcerto = Object.keys(acertosPorAssunto)
    if (assuntosComAcerto.length === 0) return

    const { data: missoesRelevantes, error: erroMissoes } = await supabaseAdmin
      .from('missoes')
      .select('id, meta')
      .in('meta->>assunto', assuntosComAcerto)

    if (erroMissoes || !missoesRelevantes) {
      console.error('[quiz/corrigir] falha ao buscar missões relevantes:', erroMissoes)
      return
    }

    for (const missao of missoesRelevantes) {
      const assunto = missao.meta.assunto as string
      const meta = missao.meta.quantidade as number
      const incremento = acertosPorAssunto[assunto]

      const { data: progressoAtual } = await supabaseAdmin
        .from('usuario_missoes')
        .select('progresso, concluida')
        .eq('user_id', userId)
        .eq('missao_id', missao.id)
        .maybeSingle()

      const progressoAnterior = progressoAtual?.progresso ?? 0
      const novoProgresso = Math.min(meta, progressoAnterior + incremento)
      const novaConclusao = novoProgresso >= meta

      const { error: erroUpsert } = await supabaseAdmin
        .from('usuario_missoes')
        .upsert(
          {
            user_id: userId,
            missao_id: missao.id,
            progresso: novoProgresso,
            concluida: novaConclusao,
          },
          { onConflict: 'user_id,missao_id' }
        )

      if (erroUpsert) {
        console.error('[quiz/corrigir] falha ao atualizar progresso de missão:', erroUpsert)
      }
    }
  }

const XP_POR_ACERTO = 10

interface ConquistaNova {
  codigo: string,
  nome: string
}

interface ProgressoGamificacao {
  xpGanho: number,
  nivelAtual: string,
  subiuDeNivel: boolean,
  conquistasNovas: ConquistaNova[]
}

async function atualizarXpNivelEConquista(
  userId: string,
  resultadosValidos: { correta: boolean }[]
):Promise<ProgressoGamificacao> {
  const acertos = resultadosValidos.filter((r) => r.correta).length
  const xpGanho = acertos * XP_POR_ACERTO

  const { data: perfil, error: erroPerfil } = await supabaseAdmin
    .from('profiles')
    .select('xp, nivel_narrativo, ultima_atividade, sequencia_dias')
    .eq('id', userId)
    .single()

  if (erroPerfil || !perfil) {
    console.error('[quiz/corrigir] falha ao buscar perfil:', erroPerfil)
    return { xpGanho: 0, nivelAtual: 'Aspirante', subiuDeNivel: false, conquistasNovas: [] }
  }

  const xpNovo = perfil.xp + xpGanho
  const nivelAnterior = perfil.nivel_narrativo
  const novoNivel = calcularNivelNarrativo(xpNovo)

  const hoje = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Fortaleza' })
  const ontem = new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Fortaleza' })

  let novaSequencia = 0
  if(perfil.ultima_atividade === hoje) {
    novaSequencia = perfil.sequencia_dias
  }else if(perfil.ultima_atividade === ontem) {
    novaSequencia = perfil.sequencia_dias + 1
  } else {
    novaSequencia = 1
  }

  await supabaseAdmin
    .from('profiles')
    .update({ xp: xpNovo, nivel_narrativo: novoNivel, ultima_atividade: hoje, sequencia_dias: novaSequencia })
    .eq('id', userId)

  const { count: totalApos } = await supabaseAdmin
    .from('tentativas_resposta')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const totalAntes = (totalApos ?? 0) - resultadosValidos.length

  const codigosParaConceder: string[] = []

  if(totalAntes === 0) {
    codigosParaConceder.push('primeira_questao', 'primeiro_quiz')
  }
  if(totalAntes < 100 && (totalApos ?? 0) >= 100 ) {
    codigosParaConceder.push('100_questoes')
  }
  if(novaSequencia === 3) codigosParaConceder.push('sequencia_3_dias')
  if(novaSequencia === 7) codigosParaConceder.push('sequencia_7_dias')
  if(novaSequencia === 30) codigosParaConceder.push('sequencia_30_dias')

  const conquistasNovas: ConquistaNova[] = []

  if(codigosParaConceder.length > 0) {
    const { data: medalhas } = await supabaseAdmin
      .from('medalha')
      .select('id, codigo, nome')
      .in('codigo', codigosParaConceder)

    for(const medalha of medalhas ?? []) {
      const { error: erroMedalha } = await supabaseAdmin
        .from('usuario_medalha')
        .insert({ user_id: userId, medalha_id: medalha.id })

      if(!erroMedalha) {
        conquistasNovas.push({ codigo: medalha.codigo, nome: medalha.nome })
      }
    }
  }

  // xpGanho: number,
  // nivelAtual: string,
  // subiuDeNivel: boolean,
  // conquistasNovas: ConquistaNova[]
  return { 
    xpGanho, 
    nivelAtual: novoNivel,
    subiuDeNivel: novoNivel !== nivelAnterior,
    conquistasNovas
  }
}

interface RespostaEnviada {
  questao_id: string
  resposta_dada: string
}

quizRouter.post('/corrigir', async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const { respostas }: { respostas: RespostaEnviada[] } = req.body ?? {}

  if (!Array.isArray(respostas) || respostas.length === 0) {
    return res.status(400).json({ error: 'Campo obrigatório: respostas (array não vazio)' })
  }

  try {
    const ids = respostas.map((r) => r.questao_id)

    const { data: questoes, error } = await supabaseAdmin
      .from('questoes')
      .select('id, assunto, enunciado, alternativas, resposta_correta')
      .in('id', ids)

    if (error || !questoes) {
      console.error('[quiz/corrigir] erro ao buscar gabarito:', error)
      return res.status(502).json({ error: 'Não foi possível corrigir o simulado agora.' })
    }

    const questoesPorId = new Map(questoes.map((q) => [q.id, q]))

    const resultados = await Promise.all(
      respostas.map(async (r) => {
        const questao = questoesPorId.get(r.questao_id)
        if (!questao) return null

        const correta = questao.resposta_correta === r.resposta_dada
        let explicacao: string | null = null

        if (!correta) {
          const prompt = `Você é um professor explicando ciências para um estudante de ensino fundamental/médio se preparando para olimpíadas científicas.

        Questão: ${questao.enunciado}
        Assunto: ${questao.assunto}
        Resposta correta: ${questao.resposta_correta}
        Resposta do aluno: ${r.resposta_dada}

        Explique, em até 3 parágrafos curtos e linguagem simples, por que a resposta correta é ${questao.resposta_correta} e não ${r.resposta_dada}.`
          try {
            explicacao = await llmClient.gerarTexto(prompt)
          } catch (err) {
            console.error('[quiz/corrigir] falha ao gerar explicação:', err)
          }
        }

        return {
          questao_id: r.questao_id,
          assunto: questao.assunto,
          correta,
          resposta_correta: questao.resposta_correta,
          explicacao,
        }
      })
    )

    const resultadosValidos = resultados.filter((r): r is NonNullable<typeof r> => r !== null)

    const { error: erroInsert } = await supabaseAdmin.from('tentativas_resposta').insert(
      resultadosValidos.map((r) => ({
        user_id: authReq.userId,
        questao_id: r.questao_id,
        resposta_dada: respostas.find((x) => x.questao_id === r.questao_id)!.resposta_dada,
        correta: r.correta,
      }))
    )

    if (erroInsert) {
      console.error('[quiz/corrigir] falha ao salvar tentativas:', erroInsert)
    }

    await atualizarProgressoMissoes(authReq.userId!, resultadosValidos)

    let gamificacao: ProgressoGamificacao = {
      xpGanho: 0,
      nivelAtual: 'Aspirante',
      subiuDeNivel: false,
      conquistasNovas: []
    }
    
    try {
      gamificacao = await atualizarXpNivelEConquista(authReq.userId!, resultadosValidos)
    }catch (err) {
      console.log('[quiz/corrigir] falha ao atualizar XP/conquistas:', err)
    }

    const porAssunto: Record<string, { acertos: number; total: number }> = {}
    for (const r of resultadosValidos) {
      porAssunto[r.assunto] ??= { acertos: 0, total: 0 }
      porAssunto[r.assunto].total++
      if (r.correta) porAssunto[r.assunto].acertos++
    }

    res.json({
      resultados: resultadosValidos,
      resumoPorAssunto: porAssunto,
      totalAcertos: resultadosValidos.filter((r) => r.correta).length,
      totalQuestoes: resultadosValidos.length,
      gamificacao
    })
  } catch (err) {
    console.error('[quiz/corrigir] erro inesperado:', err)
    res.status(500).json({ error: 'Erro interno ao corrigir o simulado.' })
  }
})