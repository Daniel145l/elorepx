import { Router } from 'express'
import { NIVEIS_NARRATIVOS } from '../lib/niveis.js'

export const gamificacaoRouter = Router()

gamificacaoRouter.get('/niveis', (_req, res) => {
  res.json(NIVEIS_NARRATIVOS)
})