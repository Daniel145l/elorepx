<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { Menu, User, X } from 'lucide-vue-next';
import { ref } from 'vue';
import BlueButton from '../buttons/BlueButton.vue';
import RedButton from '../buttons/RedButton.vue';

const aberto = ref(false)
const auth = useAuthStore()

function fechar() {
  aberto.value = false
}

</script>

<template>
  <header class="flex justify-between items-center py-5 px-5 align-middle border-b shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] sticky top-0 z-50 bg-white">
    <RouterLink to="/" @click="fechar">
      <img src="/logo.svg" alt="Elorepx">
    </RouterLink>

    <button @click="aberto = !aberto" aria-label="Abrir menu">
      <Menu v-if="!aberto" :size="20"/>
      <X v-else :size="20" />
    </button>

  </header>
  <nav
    class="fixed top-18 bg-gray-100 z-50 w-[60%] h-screen p-4 flex flex-col font-inter gap-4 text-sm transition-all duration-200 shadow-[6px_0px_6px_1px_rgba(0,0,0,0.1)]"
    :class="aberto ? 'left-0' : 'left-[-60%]'"
  >
    <RouterLink to="/" @click="fechar" class="">Home</RouterLink>
    <RouterLink to="/simulados" @click="fechar">Simulados</RouterLink>
    <RouterLink to="/olimpiadas" @click="fechar">Olimpíadas</RouterLink>
    
    <template v-if="auth.isAuthenticated">
      <BlueButton :texto="'Perfil'" :link="'perfil'" @click="fechar">
        <template #icone>
          <User :size="18"/>
        </template>
      </BlueButton>
      <!-- <RouterLink to="/perfil" @click="fechar">Perfil</RouterLink> -->
      <RedButton :texto="'Sair'" @click="fechar"/>
    </template>
    <template v-else>

    </template>
  </nav>
</template>