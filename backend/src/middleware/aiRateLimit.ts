import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import type { AuthenticatedRequest } from './requireAuth.js'

export const aiRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => {
    const authReq = req as AuthenticatedRequest
    if (authReq.userId) return authReq.userId
    return req.ip ? ipKeyGenerator(req.ip) : 'anonimo'
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite diário de uso de IA atingido. Tente novamente amanhã.' },
})