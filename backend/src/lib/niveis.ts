interface NivelInfo {
  nome: string,
  xpMinimo: number
}

export const NIVEIS_NARRATIVOS: NivelInfo[] = [
  { nome: 'Aspirante', xpMinimo: 0 },
  { nome: 'Explorador', xpMinimo: 50 },
  { nome: 'Olimpista', xpMinimo: 150 },
  { nome: 'Cientista', xpMinimo: 350 },
]

export function calcularNivelNarrativo(xp: number): string {
  
  let nivel = NIVEIS_NARRATIVOS[0].nome

  for(const n of NIVEIS_NARRATIVOS) {
    if(xp >= n.xpMinimo) nivel = n.nome
  }

  return nivel
}