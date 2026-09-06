<script setup lang="ts">
defineProps<{ 
  titulo: string,
  subtitulo: string
 }>()
</script>

<template>
  <div class="bg-[url(/background-primary.svg)] bg-center bg-cover h-screen z-0 relative box-border px-6">
    <div class="relative flex flex-col justify-center h-full gap-8">
      <div class="text-center">
        <h1 class="text-white text-2xl font-bold font-display">{{titulo}}</h1>
        <p class="text-white">{{ subtitulo }}</p>
      </div>
      <div class="bg-white rounded-2xl shadow-xl max-w-sm mx-auto w-full px-4 py-5">
        <slot/>
      </div>
    </div>
  </div>
</template>