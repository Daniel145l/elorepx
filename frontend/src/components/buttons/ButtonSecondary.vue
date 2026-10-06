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
      class="text-elorepx-purple-900 bg-white rounded-lg py-1 px-2 flex items-center justify-between w-[50%]"
      @click="handleClick"
    >
      <p class="font-bold text-sm ">{{ texto }}</p>
      <slot name="icone"></slot>
    </button>
  <!-- </RouterLink> -->
</template>