<script setup lang="ts">
defineProps<{
  text: string
  textButton?: string
  textDescription?: string
}>()
</script>

<template>
  <section class="mt-6 px-5 relative">
    <div class="relative">
      <img src="/background-home.svg" alt="" class="relative w-full">
      <div class="absolute top-[50%] flex flex-col items-center translate-y-[-50%] gap-5 px-4 text-center w-full">
        <h1 class="text-white text-center font-display text-xl">{{ text }}</h1>
        <p v-if="textDescription" class="text-white text-sm">{{ textDescription }}</p>
        <ButtonPrimary v-if="textButton" :texto="textButton" class="w-full text-sm"/>
      </div>
    </div>
  </section>
</template>