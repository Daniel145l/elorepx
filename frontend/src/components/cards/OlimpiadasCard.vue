<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next';
import { defineProps, } from 'vue';
import ButtonSecondary from '../buttons/ButtonSecondary.vue';

  defineProps<{
    nome: string
    descricao: string
    link: string
  }>()
</script>

<template>
  <article class="bg-linear-to-b rounded-lg p-5 flex flex-col gap-3 font-inter to-elorepx-purple-950">
    <div class="border border-white rounded-sm p-3 w-12 h-12 flex items-center justify-center">
      <slot name="icon"></slot>
    </div>
    <div class="flex flex-col gap-3">
      <h2 class="font-bold text-xl text-white">{{ nome }}</h2>
      <p class="text-gray-400 text-sm">{{ descricao }}</p>
    </div>
    <a v-if="link" :href="link" target="_blank">
      <ButtonSecondary :texto="'Conhecer'">
        <template #icone>
          <ArrowUpRight :size="20"/>
        </template>
      </ButtonSecondary>
    </a>

    <!-- <a v-if="link" :href="link" target="_blank">
      <ButtonSecondary :texto="'Instagram'">
        <template #icone>
          <User :size="20"/>
        </template>
      </ButtonSecondary>
    </a> -->
  </article>
</template>