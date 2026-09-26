import { Router } from "express"
import { llmClient } from "../lib/llm/index.js"
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
  const { assunto, nivel, quantidade } = req.query

  let query = supabaseAdmin
    .from('questoes')
    .select('id, assunto, nivel_dificuldade, enunciado, alternativas')
    .limit(Number(quantidade))

  if(assunto) query = query.eq('assunto', assunto as string)
  if(nivel) query = query.eq('nivel_dificuldade', nivel as string)

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
    })
  } catch (err) {
    console.error('[quiz/corrigir] erro inesperado:', err)
    res.status(500).json({ error: 'Erro interno ao corrigir o simulado.' })
  }
})