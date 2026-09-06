<script setup lang="ts">
defineProps<{ 
  texto: string,
 }>()
</script>

<template>
  <button class="bg-[#7B4DA8] text-white rounded-lg py-1">
    {{ texto }}
  </button>
</template>