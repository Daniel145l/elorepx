<script setup lang="ts">
import { useCuriosidadeDodia } from '@/composables/useCuriosidadeDoDia';
import { ChevronDown } from 'lucide-vue-next';
import { ref } from 'vue';

const { curiosidade, loading, error } = useCuriosidadeDodia();

const aberto = ref(false)
</script>

<template>
  <article class="shadow-[0px_0px_6px_0px_rgba(0,0,0,0.25)] p-4 rounded-xl mt-4 bg-white">
    <p v-if="loading">Carregando curiosidade</p>
    <p v-else-if="error">Erro ao carregar curiosidade</p>
    <div v-else-if="curiosidade" class="font-inter overflow-hidden">
      <button
        class="w-full flex flex-col justify-between gap-2"
        @click="aberto = !aberto"
      >
      <span class="text-xs leading-none text-left">Curiosidade do dia:</span>
        <div class="flex justify-between items-center w-full">
          <h3 class="font-bold capitalize text-left">{{ curiosidade.tema }}?</h3>
          <ChevronDown :size="20" class="shrink-0 transition-transform" :class="{ 'rotate-180' : aberto }"/>
        </div>
        <!-- <Sparkles v-if="!aberto" :size="20"></Sparkles> -->
      </button>
      <p v-if="aberto" class="text-sm text-justify mt-3 whitespace-pre-line transition-all">{{ curiosidade.texto }}</p>
    </div>
  </article>
</template>