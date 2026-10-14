<script setup lang="ts">
import ScientistCard from '@/components/cards/ScientistCard.vue';
import { useSupabaseList } from '@/composables/useSupabaseList';
import { supabase } from '@/lib/supabase';
import { defineProps, } from 'vue';

const props = defineProps<{
  limite:number
}>()

interface Scientist {
  id: string,
  nome: string, 
  biografia: string,
  foto_url: string | null
  fonte_url: string | null
}

const { items: cientistas, loading, error } = useSupabaseList<Scientist>(() => supabase.from('cientistas').select('id, nome, biografia, foto_url, fonte_url').limit(props.limite))

</script>

<template>
  <section class="page-container flex flex-col items-center">
    
    <p v-if="loading">Carregando...</p>
    <p v-else-if="error">Não foi possível carregar os cientistas agora. Tente novamente mais tarde</p>

    <div v-else class="w-full grid grid-cols-[repeat(auto-fit,minmax(min(18rem,100%),1fr))] justify-items-center gap-15.75 md:gap-6">
      <ScientistCard v-for="cientista in cientistas" :key="cientista.id" :cientista="cientista" />
    </div>
  </section>
</template>