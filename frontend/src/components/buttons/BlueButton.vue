<script setup lang="ts">
import { defineProps, } from 'vue';
import { useRouter } from 'vue-router';

defineProps<{
  texto: string
  link: string
}>()

const router = useRouter()

function irParaRota(link: string) {
  router.push({ name: link})
}

</script>

<template>
  <button 
    class="flex gap-1 items-center bg-blue-100 p-2 border border-blue-300 rounded-xl text-blue-800"
    @click="irParaRota(link)"
  >
    <slot name="icone"></slot>
    <span class="uppercase text-xs">{{ texto }}</span>
  </button>
</template>