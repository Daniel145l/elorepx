import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { parse } from 'yaml'
import { conteudoDinamicoRouter } from './routes/conteudoDinamico.js'
import { curiosidadeDoDiaRouter } from './routes/curiosidadeDoDia.js'
import { gamificacaoRouter } from './routes/gamificacao.js'
import { iaRouter } from './routes/ia.js'
import { quizRouter } from './routes/quiz.js'

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT ?? 3333
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'

app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Configuração do Swagger / OpenAPI
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API da Plataforma Elorepx',
      version: '1.0.0',
      description: 'Documentação da API RESTful do Elorepx para suporte a olimpíadas científicas, quizzes e gamificação.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: 'https://seu-backend-producao.com',
        description: 'Servidor de Produção',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Lê os comentários JSDoc nos arquivos de rotas
};

const spec = parse(fs.readFileSync(path.join(process.cwd(), 'openapi.yaml'), 'utf8'))
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec))

// Rotas da API
app.use('/api/ia', iaRouter)
app.use('/api/curiosidade-do-dia', curiosidadeDoDiaRouter)
app.use('/api/conteudo', conteudoDinamicoRouter)
app.use('/api/quiz', quizRouter)
app.use('/api/gamificacao', gamificacaoRouter)

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`)
  console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api/docs`)
})