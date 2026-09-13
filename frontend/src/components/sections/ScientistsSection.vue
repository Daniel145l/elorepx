<script setup lang="ts">
import ScientistCard from '@/components/cards/ScientistCard.vue';
import TitlePrimary from '@/components/titles/TitlePrimary.vue';
import { useSupabaseList } from '@/composables/useSupabaseList';
import { supabase } from '@/lib/supabase';

interface Scientist {
  id: string,
  nome: string, 
  biografia: string,
  foto_url: string | null
}

const { items: cientistas, loading, error } = useSupabaseList<Scientist>(() => supabase.from('cientistas').select('id, nome, biografia, foto_url').limit(2))

</script>

<template>
  <section class="px-5">
    <TitlePrimary :texto="'Conheça quem mudou o mundo'" class="mb-12"/>

    <p v-if="loading">Carregando...</p>
    <p v-else-if="error">Não foi possível carregar os cientistas agora. Tente novamente mais tarde</p>

    <div v-else class="flex flex-col gap-15.75 items-center">
      <ScientistCard v-for="cientista in cientistas" :key="cientista.id" :cientista="cientista" />
    </div>
  </section>
</template>