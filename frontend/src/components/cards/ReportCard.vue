<script setup lang="ts">
import ButtonPrimary from '@/components/buttons/ButtonPrimary.vue';
import DetailModal from '@/components/modal/DetailModal.vue';
import { defineProps, ref, } from 'vue';

defineProps <{
  relato: {
    id: string,
    titulo: string,
    nome_aluno: string,
    texto: string,
    fonte_url: string,
    foto_url?: string | null,
    fonte_nome: string
  }
}>()

const modalAberto = ref(false)
</script>

<template>
  <article class="flex flex-col justify-between gap-5.75 rounded-sm bg-white align-middle items-center shadow-[0px_0px_5px_3px_rgba(0,0,0,0.25)] p-7 w-[85%] md:w-full">
    <h3 class="text-elorepx-purple-700 font-bold font-inter text-lg line-clamp-2 text-center">{{ relato.nome_aluno }}</h3>
    <p class="text-center font-inter line-clamp-5 font-light text-sm">{{ relato.texto }}</p>
    <ButtonPrimary :texto="'Saiba Mais'" class="w-full" @click="modalAberto = true"/>

    <DetailModal
      v-model="modalAberto"
      :titulo="relato.titulo"
      :texto="relato.texto"
      :foto-url="relato.foto_url"
      :fonte-url="relato.fonte_url"
      :fonte-nome="relato.fonte_nome"
      nota="texto elaborado pelo Elorepx a partir da reportagem"
    />
  </article>
</template>