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

const links = [
  { to: '/', texto: 'Home' },
  { to: '/simulados', texto: 'Simulados' },
  { to: '/olimpiadas', texto: 'Olimpíadas' },
  { to: '/cientistas', texto: 'Cientistas' },
  { to: '/relatos', texto: 'Relatos olímpicos' },
]

</script>

<template>
  <header class="flex justify-between items-center py-5 px-5 align-middle border-b shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] sticky top-0 z-50 bg-white">
    <RouterLink to="/" @click="fechar"><img src="/logo.svg" alt="Elorepx"></RouterLink>

    <!-- desktop -->
    <nav class="hidden md:flex items-center gap-6 font-inter text-sm">
      <RouterLink
        v-for="l in links" :key="l.to" :to="l.to"
        class="hover:text-elorepx-purple-600"
        exact-active-class="font-bold text-elorepx-purple-600"
      >{{ l.texto }}</RouterLink>

      <template v-if="auth.isAuthenticated">
        <BlueButton :texto="'Perfil'" :link="'perfil'">
          <template #icone><User :size="18" /></template>
        </BlueButton>
        <RedButton :texto="'Sair'" />
      </template>
      <RouterLink v-else to="/login" class="font-bold text-elorepx-purple-600">Entrar</RouterLink>
    </nav>

    <!-- mobile -->
    <button class="md:hidden" @click="aberto = !aberto" aria-label="Abrir menu">
      <Menu v-if="!aberto" :size="20" />
      <X v-else :size="20" />
    </button>
  </header>

  <!-- drawer: só mobile -->
  <nav
    class="md:hidden fixed left-0 top-18 bottom-0 z-50 w-[70%] max-w-xs bg-gray-100 p-4 flex flex-col font-inter gap-4 text-sm transition-transform duration-200 shadow-[6px_0px_6px_1px_rgba(0,0,0,0.1)]"
    :class="aberto ? 'translate-x-0' : '-translate-x-full'"
    :inert="!aberto"
  >
    <RouterLink v-for="l in links" :key="l.to" :to="l.to" @click="fechar">{{ l.texto }}</RouterLink>

    <template v-if="auth.isAuthenticated">
      <BlueButton :texto="'Perfil'" :link="'perfil'" @click="fechar">
        <template #icone><User :size="18" /></template>
      </BlueButton>
      <RedButton :texto="'Sair'" @click="fechar" />
    </template>
    <RouterLink v-else to="/login" @click="fechar">Entrar</RouterLink>
  </nav>
</template>