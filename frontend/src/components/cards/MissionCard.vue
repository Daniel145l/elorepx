<script setup lang="ts">
import ButtonPrimary from '@/components/buttons/ButtonPrimary.vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

interface Missao {
  id: string
  titulo: string
  descricao: string
  meta: { quantidade?: number }
  usuario_missoes: { progresso: number; concluida: boolean }[]
}

const missao = ref<Missao | null>(null)
const todasConcluidas = ref(false)
const loading = ref(true)

onMounted(async () => {
  const { data } = await supabase
    .from('missoes')
    .select('id, titulo, descricao, meta, usuario_missoes(progresso, concluida)')
    .order('ordem')

  const lista = (data ?? []) as Missao[]
  const pendentes = lista.filter((m) => !m.usuario_missoes[0]?.concluida)

  // continua a que já começou; se não houver, a próxima na ordem
  const emAndamento = pendentes.find((m) => (m.usuario_missoes[0]?.progresso ?? 0) > 0)

  missao.value = emAndamento ?? pendentes[0] ?? null
  todasConcluidas.value = lista.length > 0 && pendentes.length === 0
  loading.value = false
})

const auth = useAuthStore()

const progressoAtual = computed(() => missao.value?.usuario_missoes[0]?.progresso ?? 0)
const meta = computed(() => missao.value?.meta.quantidade ?? 1)
const percentual = computed(() => Math.min(100, Math.round((progressoAtual.value / meta.value) * 100)))

</script>

<template>
  <div
    v-if="!loading && (missao || todasConcluidas)"
    class="bg-white border-2 shadow-[12px_12px_4px_0px_rgba(0,0,0,0.67)] flex flex-col items-center gap-3 rounded-xl px-7 py-5"
  >
    <template v-if="missao">
      <p class="font-display text-sm">{{ missao.titulo.toUpperCase() }}</p>
      <p class="font-display text-[#3A3737] text-center text-xs">{{ missao.descricao }}</p>

      <template v-if="auth.isAuthenticated">
        <div class="bg-[#D4D3D3] rounded-full h-2 w-full overflow-hidden border">
          <div class="bg-elorepx-purple-600 h-full" :style="{ width: percentual + '%' }" />
        </div>
        <span class="text-black text-xs">{{ percentual }}% concluído</span>
        <RouterLink to="/simulados" class="w-full">
          <ButtonPrimary texto="Ir para missão →" class="w-full text-sm" />
        </RouterLink>
      </template>

      <template v-else>
        <RouterLink to="/login">
          <ButtonPrimary texto="Fazer login para começar" class="w-full" :link="'simulados'"/>
        </RouterLink>
      </template>
    </template>

    <template v-else>
      <p class="font-display text-sm text-center">TODAS AS MISSÕES CONCLUÍDAS!</p>
      <p class="font-display text-[#3A3737] text-center text-xs">
        Você completou tudo por enquanto. Novas missões chegam em breve.
      </p>
    </template>
  </div>
</template>