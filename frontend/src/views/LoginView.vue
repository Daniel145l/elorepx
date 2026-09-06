<script setup lang="ts">
import AuthLayout from '@/components/AuthLayout.vue';
import BaseInput from '@/components/BaseInput.vue';
import ButtonPrimary from '@/components/ButtonPrimary.vue';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';


const email = ref('')
const password = ref('')
const auth = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  try {
    await auth.signIn(email.value, password.value)
    router.push({ name: 'home' })
  } catch {
    //
  }
}

</script>

<template>
  <AuthLayout titulo="Bem-vindo de volta" subtitulo="Faça login para continuar">
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-3 text-center">
      <BaseInput v-model="email" typeInput="email" placeholderInput="email" required />
      <BaseInput v-model="password" typeInput="password" placeholderInput="senha" required />

        <p v-if="auth.errorMessage" class="text-sm text-red-500">{{ auth.errorMessage }}</p>

        <ButtonPrimary :disabled="auth.loading" :texto="auth.loading ? 'Entrando' : 'Login'" />

      <RouterLink to="/cadastro" class="text-[#595959] text-xs">Ainda não tem cadastro? Clique aqui</RouterLink>
    </form>
  </AuthLayout>
</template>