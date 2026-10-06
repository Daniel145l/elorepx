<script setup lang="ts">
import OlimpiadasCard from '@/components/cards/OlimpiadasCard.vue';
import ApresentationSection from '@/components/sections/ApresentationSection.vue';
import TitlePrimary from '@/components/titles/TitlePrimary.vue';
import { useSupabaseList } from '@/composables/useSupabaseList';
import { supabase } from '@/lib/supabase';
import { FlaskConical, Microscope, Rocket, ZapIcon } from 'lucide-vue-next';


 interface Olimpiada {
  id: string
  nome: string
  descricao: string
  detalhamento: string
  site_oficial: string
 }

const { items: olimpiadas } = useSupabaseList<Olimpiada>(() => 
  supabase.from('olimpiadas').select('id, nome, descricao, detalhamento, site_oficial')
)

function olimpiadaClass(olimpiadaNome: string): string {
  if (olimpiadaNome === 'OBA') return 'from-green-950'
  if (olimpiadaNome === 'OBFEP') return 'from-yellow-950 to-black'
  if (olimpiadaNome === 'OBQ') return 'from-blue-950'
  return 'from-elorepx-purple-900'
}

</script>

<template>
  <!-- <Header /> -->
  <ApresentationSection :text="'Conheça mais sobre as olimpíadas'" :text-button="'Treinar'" :link="'simulados'"/>

  <section class="px-4 mt-8 flex flex-col gap-4">
    <TitlePrimary :texto="'Olimpíadas'" />

    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">

      <OlimpiadasCard 
        v-for="olimpiada in olimpiadas"
        :nome="olimpiada.descricao + ' - ' + olimpiada.nome"
        :descricao="olimpiada.detalhamento"
        :link="olimpiada.site_oficial"
        :class="olimpiadaClass(olimpiada.nome)"
      > 
        <template #icon>
          <Rocket v-if="olimpiada.nome === 'OBA'" class="text-white" />
          <ZapIcon v-else-if="olimpiada.nome === 'OBFEP'" class="text-white" />
          <Microscope v-else-if="olimpiada.nome === 'ONC'" class="text-white" />
          <FlaskConical v-else-if="olimpiada.nome === 'OBQ'" class="text-white" />
        </template>
      </OlimpiadasCard>
    </div>

  </section>
</template>