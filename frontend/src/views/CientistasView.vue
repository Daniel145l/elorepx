<script setup lang="ts">
import ApresentationSection from '@/components/sections/ApresentationSection.vue';
import ScientistsSection from '@/components/sections/ScientistsSection.vue';

// interface Cientista {
//   id: string,
//   nome: string, 
//   biografia: string,
//   foto_url: string | null,
//   fonte_licenca: string,
// }

// const { items: cientistas, loading, error } = useSupabaseList<Cientista>(() => 
//   supabase.from('cientistas').select('id, nome, biografia, foto_url, fonte_licenca')
// )

</script>

<template>
  <ApresentationSection :text="'Conheça aqueles que mudaram o mundo'" />

  <ScientistsSection :limite="3" class="mt-8"/>

  <!-- <p v-if="error">Erro ao carregar página. Tente novamente</p>

  <section 
    v-if="!loading && !error" 
    class="flex flex-col gap-12 items-center justify-center"
  >
    <div v-for="cientista in cientistas">
      <ScientistCard :cientista="cientista" />
    </div>
  </section> -->
</template>