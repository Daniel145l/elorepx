<script setup lang="ts">
defineProps<{
  titulo: string,
  texto: string
}>()
</script>


<template>
  <div class="flex flex-col justify-between shadow-[0px_3px_8px_0px_#26123C] px-5 py-3.75 rounded-[7px] items-center gap-3.25 w-[85%]">
    <slot name ="icon" />
    <h4 class="font-bold font-inter text-sm">{{ titulo }}</h4>
    <p class="font-inter text-center text-xs">{{ texto }}</p>
  </div>
</template>