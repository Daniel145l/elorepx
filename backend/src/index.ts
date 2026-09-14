import cors from 'cors'
import 'dotenv/config'
import express from 'express'
// import { conteudoDinamicoRouter } from './routes/conteudoDinamico.js'
import { curiosidadeDoDiaRouter } from './routes/curiosidadeDoDia.js'
import { iaRouter } from './routes/ia.js'

const app = express()
const PORT = process.env.PORT ?? 3333
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'

app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/ia', iaRouter)
app.use('/api/curiosidade-do-dia', curiosidadeDoDiaRouter)
// app.use('/api/conteudo', conteudoDinamicoRouter)

 app.listen(PORT, () => {
  console.log(`backend rodando em http://localhost${PORT}`)
})