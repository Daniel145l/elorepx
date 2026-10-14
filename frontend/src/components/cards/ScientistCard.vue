<script setup lang="ts">
import ButtonPrimary from '@/components/buttons/ButtonPrimary.vue';
import DetailModal from '@/components/modal/DetailModal.vue';
import { ref } from 'vue';

defineProps<{
  cientista: {
    nome: string
    biografia: string
    foto_url: string | null
    fonte_url?: string | null
    fonte_licenca?: string | null
  }
}>()

const modalAberto = ref(false)
</script>

<template>
  <article class="flex flex-col justify-between gap-5.75 rounded-sm bg-white align-middle items-center shadow-[0px_0px_5px_3px_rgba(0,0,0,0.25)] p-7 w-[85%] font-inter md:w-full">
    <img v-if="cientista.foto_url" :src="cientista.foto_url" :alt="cientista.nome" class="w-5 rounded-[10px] "/>
    <div v-else>
      <!-- pensar em algo para quando não tiver foto -->
    </div>
    <h3 class="text-elorepx-purple-700 font-bold text-base">{{ cientista.nome }}</h3>
    <p class="text-center line-clamp-5 font-light text-sm">{{ cientista.biografia }}</p>

    <ButtonPrimary :texto="'Saiba Mais'" class="w-full" @click="modalAberto = true" />

    <DetailModal
      v-model="modalAberto"
      :titulo="cientista.nome"
      :texto="cientista.biografia"
      :foto-url="cientista.foto_url"
      :fonte-url="cientista.fonte_url"
      fonte-nome="Wikipédia"
      :nota="cientista.fonte_licenca ? `Licença ${cientista.fonte_licenca}` : null"
    />
  </article>
</template>