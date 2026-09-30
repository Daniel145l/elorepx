<script setup lang="ts">
defineProps<{
  texto: string
}>()
</script>

<template>
  <!-- <div class="text-white bg-elorepx-purple-600 text-center px-4 py-4 rounded-xl"> -->
     <h2 class="text-xl font-display text-center text-elorepx-purple-600 border-b ">{{ texto }}</h2>
  <!-- </div> -->
</template>