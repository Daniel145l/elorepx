import type { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

export interface AuthenticatedRequest extends Request {
  userId?: string
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação ausente' })
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if(error || !data.user) {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }

  req.userId = data.user.id
  next()
}
