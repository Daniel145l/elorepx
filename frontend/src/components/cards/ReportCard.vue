<script setup lang="ts">
import ButtonPrimary from '@/components/buttons/ButtonPrimary.vue';

defineProps <{
  relato: {
    id: string,
    titulo: string,
    texto: string,
    fonte_url: string,
    fonte_nome: string
  }
}>()
</script>

<template>
  <article class="flex flex-col justify-between gap-5.75 rounded-sm bg-white align-middle items-center shadow-[0px_0px_5px_3px_rgba(0,0,0,0.25)] p-7 w-[85%]">
    <h3 class="text-elorepx-purple-700 font-bold font-inter text-lg line-clamp-2 text-center">{{ relato.titulo }}</h3>
    <p class="text-center font-inter line-clamp-5 font-light text-sm">{{ relato.texto }}</p>
    <ButtonPrimary :texto="'Saiba Mais'" class="w-full" />
  </article>
</template>