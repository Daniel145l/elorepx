<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { LogOut } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const auth = useAuthStore()
const router =  useRouter()

async function sair() {
  await auth.signOut()
  router.push({ name: 'login' })
}
</script>

<template>
  <button 
    class="flex gap-1 items-center bg-red-100 p-2 border border-red-300 rounded-xl text-red-800"
    @click="sair"
  >
    <LogOut :size="15"/>
    <span class="uppercase text-xs">Sair</span>
  </button>
</template>