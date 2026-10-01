<script setup lang="ts">
defineProps<{
  texto: string,
  descricao: string,
}>()
</script>


<template>
  <div class="flex flex-col gap-2 rounded-md p-4 mt-2 text-white bg-linear-to-r from-elorepx-purple-600 to-elorepx-purple-500">
    <div class="flex items-center gap-1">
      <slot name ="icon" />
      <h3 class="font font-inter text-base">{{ texto }}</h3>
    </div>
    <p class="font-inter font-bold text-sm">{{ descricao }}</p>
    <slot name="barProgress"></slot>
  </div>
</template>