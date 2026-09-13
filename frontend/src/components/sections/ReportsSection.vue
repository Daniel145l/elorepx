<script setup lang="ts">
import ReportCard from '@/components/cards/ReportCard.vue';
import TitlePrimary from '@/components/titles/TitlePrimary.vue';
import { useSupabaseList } from '@/composables/useSupabaseList';
import { supabase } from '@/lib/supabase';

interface Report {
  id: string,
  titulo: string,
  texto: string,
  fonte_url: string,
  fonte_nome: string
}

const { items: relatos, loading, error } = useSupabaseList<Report>(() => supabase.from('relatos_alunos').select('id, titulo, texto, fonte_url, fonte_nome').limit(2))
</script>

<template>
  <section class="px-5 mb-14">
    <TitlePrimary :texto="'Eles também começaram assim!'" class="mb-12" />

    <p v-if="loading">Carregando...</p>
    <p v-else-if="error">Não foi possível carregar os relatos agora. Tente novamente mais tarde</p>

    <div v-else class="flex flex-col gap-15.75 items-center">
      <ReportCard v-for="relato in relatos" :key="relato.id" :relato="relato" />
    </div>
  </section>
</template>