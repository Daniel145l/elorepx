<script setup lang="ts">
const props = defineProps<{ 
  texto: string,
  link?: string
 }>()

const handleClick = () => {
  if (props.link) {
    window.location.href = props.link
  }
}
</script>

<template>
  <!-- <RouterLink to={link} > -->
    <button 
      class="bg-elorepx-purple-700 text-white rounded-lg py-1 px-2 flex items-center justify-center"
      @click="handleClick"
    >
      <p>{{ texto }}</p>
    </button>
  <!-- </RouterLink> -->
</template>