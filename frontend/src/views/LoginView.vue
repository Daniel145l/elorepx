<script setup lang="ts">
import AuthLayout from '@/components/AuthLayout.vue';
import BaseInput from '@/components/BaseInput.vue';
import ButtonPrimary from '@/components/buttons/ButtonPrimary.vue';
import { useAuthStore } from '@/stores/auth';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';


const email = ref('')
const password = ref('')
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const mensagemAviso = computed(() => 
  route.query.aviso === 'login-necessario' ? 'Você precisa fazer login para acessar os simulados' : null
)

// const mensagemAviso = "Você precisa fazer login para acessar os simulados"

async function handleSubmit() {
  try {
    await auth.signIn(email.value, password.value)
    const destino = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.push(destino)
  } catch {
    //
  }
}

</script>

<template>
  <AuthLayout titulo="Bem-vindo de volta" subtitulo="Faça login para continuar">
    <p v-if="mensagemAviso" class="text-center text-xs text-red-500 mb-3">{{ mensagemAviso }}</p>
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-3 text-center">
      <BaseInput v-model="email" typeInput="email" placeholderInput="email" required />
      <BaseInput v-model="password" typeInput="password" placeholderInput="senha" required />

        <p v-if="auth.errorMessage" class="text-sm text-red-500">{{ auth.errorMessage }}</p>

        <ButtonPrimary :disabled="auth.loading" :texto="auth.loading ? 'Entrando' : 'Login'" />

      <RouterLink to="/cadastro" class="text-[#595959] text-xs">Ainda não tem cadastro? Clique aqui</RouterLink>
    </form>
  </AuthLayout>
</template>