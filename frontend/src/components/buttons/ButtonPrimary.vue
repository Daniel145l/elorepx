<script setup lang="ts">
defineProps<{ 
  texto: string,
  // link: string
 }>()
</script>

<template>
  <!-- <RouterLink to={link} > -->
    <button class="bg-elorepx-purple-700 text-white rounded-lg py-1 px-2 flex items-center justify-center">
      <p>{{ texto }}</p>
    </button>
  <!-- </RouterLink> -->
</template>