import { Router } from "express";
import { llmClient } from "../lib/llm/index.js";

export const conteudoDinamicoRouter = Router()

interface CacheApod {
  data: unknown
  expiraEm: number
}
 
let cacheApod: CacheApod | null = null
const CACHE_TTL_MS = 60 * 60 * 1000

function limparTextoExplanation(rawText: string): string {
  if (!rawText) return ""

  // 1. Remove tags HTML (ex: <strong>, <a href="...">, <br>)
  let textoLimpo = rawText.replace(/<[^>]*>?/gm, '')

  // 2. Remove o prefixo "Explanation: "
  textoLimpo = textoLimpo.replace(/^Explanation:\s*/i, '')

  // 3. Corta avisos de rodapé institucionais da NASA
  const corteAvisoEmail = textoLimpo.indexOf("APOD's email for image submissions")
  if (corteAvisoEmail !== -1) {
    textoLimpo = textoLimpo.substring(0, corteAvisoEmail)
  }

  const corteAvisoSite = textoLimpo.indexOf("APOD's main NASA site has moved")
  if (corteAvisoSite !== -1) {
    textoLimpo = textoLimpo.substring(0, corteAvisoSite)
  }

  const corteAvisoAmanha = textoLimpo.indexOf("Tomorrow's picture:")
  if (corteAvisoAmanha !== -1) {
    textoLimpo = textoLimpo.substring(0, corteAvisoAmanha)
  }

  return textoLimpo.trim()
}

function extrairImagemUrl(item: any): string {
  // Tenta hdurl ou url primeiro
  if (item.hdurl) return item.hdurl
  if (item.url && !item.url.includes('/image-article/')) return item.url

  // Se 'url' for o link da matéria em vez do arquivo de imagem, extrai do basic_html via regex
  if (item.basic_html) {
    const matchImg = item.basic_html.match(/<IMG\s+SRC=["']([^"']+)["']/i)
    if (matchImg && matchImg[1]) {
      return matchImg[1]
    }
  }

  return item.url || ""
}

async function traduzirEResumir(texto: string): Promise<string> {
  const prompt = `Você é um divulgador científico para estudantes de ensino fundamental e médio.
Traduza o texto a seguir do inglês para o português do Brasil de forma clara e envolvente.
Remova saudações, links ou avisos institucionais. Retorne apenas a explicação em até 3 parágrafos curtos:

${texto}`
  return llmClient.gerarTexto(prompt)
}

conteudoDinamicoRouter.get('/nasa/apod', async (req, res) => {
  if(cacheApod && cacheApod.expiraEm > Date.now()) {
    res.json(cacheApod.data)
  }

  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY'

  try {
    const response = await fetch('https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=1')

    if(!response.ok) {
      throw new Error(`Erro ao buscar dado da API da NASA: ${response.status}`)
    }

    const retornoAPOD = await response.json()
    const dadosOriginais = await retornoAPOD[0]

    if(!dadosOriginais) {
      throw new Error('Dados não retornados da API da NASAA')
    }


    const textoInglesLimpo = limparTextoExplanation(dadosOriginais.explanation)
    const imgUrl = extrairImagemUrl(dadosOriginais)

    const [tituloPt, explanationPt] = await Promise.all([
      llmClient.gerarTexto(`Traduza o seguinte título de astronomia para o português do Brasil. Retorne APENAS a tradução: "${dadosOriginais.title}"`),
      traduzirEResumir(dadosOriginais.explanation)
    ])

    const dadosTraduzidos = {
      title: tituloPt,
      explanation: explanationPt,
      url: imgUrl,
      hdurl: dadosOriginais.hdurl || imgUrl,
      media_type: dadosOriginais.media_type || 'image',
      date: dadosOriginais.date,
      copyright: dadosOriginais.copyright ? dadosOriginais.copyright.replace(/<[^>]*>?/gm, '') : null
    }

    cacheApod = { data: dadosTraduzidos, expiraEm: Date.now() + CACHE_TTL_MS }
    res.json(dadosTraduzidos)

  }catch (err) {
    console.error('[conteudo-dinamico/nasa] erro: ', err)
    res.status(502).json({ error: 'Não foi possível obter o conteúdo da NASA no momento.' })
  }
})