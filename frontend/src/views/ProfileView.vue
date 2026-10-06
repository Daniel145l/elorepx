<script setup lang="ts">
import ButtonLogOut from '@/components/buttons/ButtonLogOut.vue'
import LevelCard from '@/components/cards/LevelCard.vue'
import StatsCard from '@/components/cards/StatsCard.vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { Award, Flame, Lock, Trophy, Zap } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

interface Perfil {
  nickname: string
  xp: number
  nivel_narrativo: string
  sequencia_dias: number
  created_at: string
}

interface MedalhaCatalogo {
  id: string
  codigo: string
  nome: string
  descricao: string | null
}

interface NivelInfo {
  nome: string
  xpMinimo: number
}

const auth = useAuthStore()

const perfil = ref<Perfil | null>(null)
const catalogoMedalhas = ref<MedalhaCatalogo[]>([])
const codigosConquistados = ref<Set<string>>(new Set())
const dataConquista = ref<Record<string, string>>({})
const niveis = ref<NivelInfo[]>([])
const carregando = ref(true)
const erro = ref<string | null>(null)

onMounted(async () => {
  if (!auth.user) {
    erro.value = 'Você não está logado :( Faça login para visualizar suas informações'
    carregando.value = false
    return
  }

  try {
    const [perfilRes, catalogoRes, conquistadasRes, niveisRes] = await Promise.all([
      supabase.from('profiles').select('nickname, xp, nivel_narrativo, sequencia_dias, created_at').eq('id', auth.user.id).single(),
      supabase.from('medalhas').select('id, codigo, nome, descricao'),
      supabase.from('usuario_medalhas').select('conquistada_em, medalha_id').eq('user_id', auth.user.id),
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gamificacao/niveis`).then((r) => r.json()),
    ])

    if (perfilRes.error) throw new Error('Não foi possível carregar seu perfil')

    perfil.value = perfilRes.data
    catalogoMedalhas.value = catalogoRes.data ?? []
    niveis.value = niveisRes

    const idParaCodigo = new Map(catalogoMedalhas.value.map((m) => [m.id, m.codigo]))
    for (const c of conquistadasRes.data ?? []) {
      const codigo = idParaCodigo.get(c.medalha_id)
      if (codigo) {
        codigosConquistados.value.add(codigo)
        dataConquista.value[codigo] = c.conquistada_em
      }
    }
  } catch (err) {
    erro.value = (err as Error).message
  } finally {
    carregando.value = false
  }
})

const progresso = computed(() => {
  if (!perfil.value || niveis.value.length === 0) return null

  const ordenados = [...niveis.value].sort((a, b) => a.xpMinimo - b.xpMinimo)
  const idxAtual = ordenados.findIndex((n) => n.nome === perfil.value!.nivel_narrativo)
  const atual = ordenados[idxAtual]
  const proximo = ordenados[idxAtual + 1]

  if (!proximo) {
    return { percentual: 100, faltam: 0, proximoNome: null as string | null }
  }

  const faixa = proximo.xpMinimo - atual.xpMinimo
  const avancado = perfil.value.xp - atual.xpMinimo
  const percentual = Math.min(100, Math.round((avancado / faixa) * 100))

  return { percentual, faltam: proximo.xpMinimo - perfil.value.xp, proximoNome: proximo.nome }
})

function formatarData(dataIso: string): string {
  return new Date(dataIso).toLocaleDateString('pt-BR')
}
</script>

<template>

  <!-- <Header /> -->

  <div class="max-w-xl mx-auto px-4 py-8 font-inter">
    <p v-if="carregando" class="text-center text-gray-500">Carregando perfil...</p>
    <p v-else-if="erro" class="text-center text-red-600">{{ erro }}</p>

    <template v-else-if="perfil">
      <div class="flex justify-between items-center">
        <div class="flex gap-1">
          <h2 class="text-xl">Olá,</h2>
          <h2 class="font-bold text-elorepx-purple-700 text-xl">{{ perfil.nickname }}</h2>
        </div>
        <ButtonLogOut :texto="'Sair'"/>
      </div>
      <section class="mt-8">
        <div class="grid grid-cols-2 gap-2 align-middle">
          <StatsCard :descricao="'XP total'" :texto="perfil.xp.toString()" class="bg-linear-to-b from-green-400 to-green-600">
            <template #icon><Zap :size="20"/></template>
          </StatsCard>
          <StatsCard :descricao="'dias de ofensiva'" :texto="perfil.sequencia_dias.toString()" class="bg-linear-to-b from-orange-400 to-orange-600">
            <template #icon><Flame :size="20" /></template>
          </StatsCard>
        </div>
        <LevelCard :texto="'Seu nível'" :descricao="perfil.nivel_narrativo">
          <template #icon>
            <Trophy :size="15"/>
          </template>
          <template v-if="progresso" class="mt-4" #barProgress>
            <div class="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div class="bg-white h-full" :style="{ width: progresso.percentual + '%' }" />
            </div>
            <p v-if="progresso.proximoNome" class="text-xs mt-2 opacity-80">
              Faltam {{ progresso.faltam }} XP para {{ progresso.proximoNome }}
            </p>
            <p v-else class="text-xs mt-2 opacity-80">Nível máximo alcançado</p>
          </template>
        </LevelCard>
      </section>

      <section class="mt-8">
        <h2 class="font-bold text-gray-800 mb-4">Suas medalhas</h2>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="medalha in catalogoMedalhas"
            :key="medalha.codigo"
            class="border rounded-xl p-4 text-center"
            :class="codigosConquistados.has(medalha.codigo) ? 'border-elorepx-purple-600 bg-purple-50' : 'border-gray-200 opacity-50'"
          >
            <Award v-if="codigosConquistados.has(medalha.codigo)" :size="20" class="mx-auto text-elorepx-purple-600" />
            <Lock v-else :size="20" class="mx-auto text-gray-400" />
            <p class="text-sm font-semibold mt-1">{{ medalha.nome }}</p>
            <p v-if="medalha.descricao" class="text-xs text-gray-500 mt-1">{{ medalha.descricao }}</p>
            <p v-if="codigosConquistados.has(medalha.codigo)" class="text-xs text-elorepx-purple-700 mt-2">
              Conquistada em {{ formatarData(dataConquista[medalha.codigo]) }}
            </p>
          </div>
        </div>
      </section>
      <!-- *FORMATAR A DATA <span>Por aqui desde {{ perfil.created_at }}</span> -->
    </template>
  </div>

  <!-- * TODO - ALTERAR NICKNAME E SAIR
   <section>
    <h2 class="font-bold text-gray-800 mb-4">Configurações</h2>
    <button @click="handleSubmit">Sair</button>
  </section> -->
</template>