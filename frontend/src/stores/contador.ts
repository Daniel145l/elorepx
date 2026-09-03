import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useContadorStore = defineStore('contador', () => {
  const valor = ref(0);
  const dobro = computed(() => valor.value * 2);
  function incrementar() {
    valor.value++;
  }

  return { valor, dobro, incrementar };
  
});
