<script setup lang="ts">
  import { useAuthStore } from '@/stores/auth';
import { RouterView } from 'vue-router';

  const auth = useAuthStore();

  async function tentarCadastro() {
    try {
      await auth.signUp('daniellucasm18+teste2@gmail.com', '12345678', 'teste')
      console.log("cadastro feito com sucesso", auth.user)
    }catch {
      console.log("erro", auth.errorMessage);
    }
  }
</script>

<template>
  <button @click="tentarCadastro">testar cadastros</button>
  <RouterView />
</template>
