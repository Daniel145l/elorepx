import { Router } from "express";
import { llmClient } from "../lib/llm/index.js";

export const conteudoDinamicoRouter = Router()

interface CacheApod {
  data: unknown
  expiraEm: number
}
 
let cacheApod: CacheApod | null = null
const CACHE_TTL_MS = 60 * 60 * 1000

async function traduzir(texto: string): Promise<string> {
  const prompt = `Traduza o texto a seguir do inglês para o português do Brasil. Devolva APENAS a tradução, sem nenhum comentário, introdução ou explicação adicional:\n\n${texto}`
  return llmClient.gerarTexto(prompt)
}

conteudoDinamicoRouter.get('/nasa/apod', async (req, res) => {
  if(cacheApod && cacheApod.expiraEm > Date.now()) {
    res.json(cacheApod.data)
  }

  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY'

  try {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`)

    if(!response.ok) {
      throw new Error(`Erro ao buscar dado da API da NASA: ${response.status}`)
    }

    const dadosOriginais = await response.json()

    const [tituloPt, explanationPt] = await Promise.all([
      traduzir(dadosOriginais.titulo),
      traduzir(dadosOriginais.explanation)
    ])

    const dadosTraduzidos = {
      ...dadosOriginais,
      title: tituloPt,
      explanation: explanationPt
    }

    cacheApod = { data: dadosTraduzidos, expiraEm: Date.now() + CACHE_TTL_MS }
    res.json(dadosTraduzidos)

  }catch (err) {
    console.error('[conteudo-dinamico/nasa] erro: ', err)
    res.status(502).json({ error: 'Não foi possível obter o conteúdo da NASA no momento.' })
  }
})