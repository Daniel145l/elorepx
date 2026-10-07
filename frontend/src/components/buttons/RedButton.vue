<script setup lang="ts">
defineProps<{
  texto: string
}>()
import { useAuthStore } from '@/stores/auth';
import { LogOut } from 'lucide-vue-next';
import { defineProps, } from 'vue';
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
    <span class="uppercase text-xs">{{ texto }}</span>
  </button>
</template>