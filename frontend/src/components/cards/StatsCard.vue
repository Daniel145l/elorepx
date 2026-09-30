<script setup lang="ts">
defineProps<{
  texto: string,
  descricao: string,
}>()
</script>


<template>
  <div class="flex flex-col gap-4 rounded-md p-4 text-white">
    <slot name ="icon" />
    <h3 class="font-bold font-inter text-base">{{ texto }}</h3>
    <p class="font-inter text-xs">{{ descricao }}</p>
  </div>
</template>