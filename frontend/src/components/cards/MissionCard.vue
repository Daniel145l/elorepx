<script setup lang="ts">
import ButtonPrimary from '@/components/buttons/ButtonPrimary.vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'


interface MissaoComProgresso {
  id: string
  titulo: string
  descricao: string
  meta: { quantidade?: number }
  usuario_missoes: { progresso: number; concluida: boolean }[]
}

const auth = useAuthStore()
const missao = ref<MissaoComProgresso | null>(null)
const loading = ref(true)

onMounted(async () => {
  const { data } = await supabase
  .from('missoes')
  .select('id, titulo, descricao, meta, usuario_missoes(progresso, concluida)')
  .limit(1)
  .single()

  missao.value = data
  loading.value = false
})

const progressoAtual = computed(() => missao.value?.usuario_missoes[0]?.progresso ?? 0)
const meta = computed(() => missao.value?.meta.quantidade ?? 1)
const percentual = computed(() => Math.min(100, Math.round((progressoAtual.value / meta.value) * 100)))

</script>

<template>
    <div v-if="!loading && missao" class="bg-white border-2 shadow-[12px_12px_4px_0px_rgba(0,0,0,0.67)] flex flex-col items-center gap-3
     rounded-xl px-7 py-5">
      <p class="font-display text-sm">{{ missao.titulo.toUpperCase() }}</p>
      <p class="font-display text-[#3A3737] text-center text-xs">{{ missao.descricao }}</p>

      <template v-if="auth.isAuthenticated">
        <div class="bg-[#D4D3D3] rounded-full h-2 w-full overflow-hidden border">
          <div class="bg-elorepx-purple-600 h-full w-full" :style="{ width: percentual + '%' }" />
        </div>
        <span class="text-black text-xs">{{percentual}}% concluído</span>
        <ButtonPrimary texto="Ir para missao →" class="w-full text-sm"/>  
      </template>

      <template v-else>
        <RouterLink to="/login">
          <ButtonPrimary texto="Fazer login para começar" class="w-full" />
        </RouterLink>
      </template>
    </div>
</template>