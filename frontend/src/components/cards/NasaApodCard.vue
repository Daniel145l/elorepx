<script setup lang="ts">
import { useNasaApod } from '@/composables/useNasaApod';
import { ChevronDown } from 'lucide-vue-next';
import { ref } from 'vue';

const { apod, error, loading } = useNasaApod()

const aberto = ref(false)
</script>

<template>
  <article class="shadow-[0px_0px_6px_0px_rgba(0,0,0,0.25)] p-4 rounded-xl mt-4 bg-white">
    <p v-if="loading">Carregando curiosidade</p>
    <p v-else-if="error">Erro ao carregar curiosidade</p>
    <div v-else-if="apod" class="font-inter overflow-hidden">
      <button
        class="w-full flex flex-col justify-between gap-2"
        @click="aberto = !aberto"
      >
      <span class="text-xs leading-none text-left">{{ apod.media_type === 'image' ? 'Foto ': 'Vídeo ' }} do dia:</span>
        <div class="flex justify-between items-center w-full mb-3">
          <h3 class="font-bold text-left">O que a NASA quer te mostrar</h3>
          <ChevronDown :size="20" class="shrink-0 transition-transform" :class="{ 'rotate-180' : aberto }"/>
        </div>
        <!-- <Sparkles v-if="!aberto" :size="20"></Sparkles> -->
      </button>
      <img v-if="apod.media_type === 'image' && aberto" :src="apod.url" :alt="apod.title != 'indefinido' ? apod.title : apod.explanation">
      <a v-else-if="apod.media_type != 'image' && aberto" :href="apod.url" target="_blank" rel="noopener noreferrer" class="text-center inline-block w-full underline">Ver vídeo da NASA</a>
      <h4 v-if="apod.title != 'indefinido' && aberto" class="font-bold capitalize text-center">{{ apod.title }}</h4>
      <p v-if="aberto" class="text-sm text-justify mt-3 whitespace-pre-line transition-all">{{ apod.explanation }}</p>
      <!-- {{ apod.explanation }} -->
      <p v-if="apod.copyright && aberto" class="text-sm text-justify mt-3 whitespace-pre-line transition-all">Créditos: {{ apod.copyright }}</p>
    </div>
  </article>
</template>