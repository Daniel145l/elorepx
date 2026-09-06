<script setup lang="ts">
defineProps<{ 
  placeholderInput: string,
  typeInput: string
 }>()

 const model = defineModel<string>({required:true})
</script>

<template>
  <input v-model="model" :type="typeInput" :placeholder="placeholderInput" required class="w-full py-2 px-2 border-2 rounded-xl border-[#595959] outline-none text-sm">
</template>