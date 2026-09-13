import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { supabaseAdmin } from './lib/supabaseAdmin.js'

const app = express()
const PORT = process.env.PORT ?? 3333
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'

app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`backend rodando em http://localhost${PORT}`)
})

app.get('/test-db', async(req, res) => {
  const { data, error } = await supabaseAdmin.from('cientistas').select('id, nome').limit(3)
  res.json({data, error})
})