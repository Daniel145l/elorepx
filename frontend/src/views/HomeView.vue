<script setup lang="ts">
import ButtonPrimary from '@/components/buttons/ButtonPrimary.vue';
import MissionCard from '@/components/cards/MissionCard.vue';
import PowerCard from '@/components/cards/PowerCard.vue';
import Header from '@/components/header/Header.vue';
import ReportsSection from '@/components/sections/ReportsSection.vue';
import ScientistsSection from '@/components/sections/ScientistsSection.vue';
import TitlePrimary from '@/components/titles/TitlePrimary.vue';
import { Brain, Eye, HatGlasses } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  try {
    await auth.signOut()
    router.push({ name: 'login' })
  } catch {

  }
}

</script>

<template>
  <Header />

  <section class="mt-6 px-5 relative">
    <div class="relative">
      <img src="/background-home.svg" alt="" class="relative w-full">
      <div class="absolute top-[50%] flex flex-col items-center translate-y-[-50%] gap-5 px-4 text-center w-full">
        <h1 class="text-white text-center font-display text-xl">Vire um cientista e venha explorar o mundo que está a sua volta</h1>
        <RouterLink to="/cadastrar" class="w-[40%]">
          <ButtonPrimary :texto="'Explorar'" class="w-full text-sm"/>
        </RouterLink>
      </div>
    </div>
  </section>

  <section class="px-5 my-12">
    <!-- <div class="bg-[url(/fita.svg)] bg-center bg-contain bg-no-repeat w-full h-21.25">
      <h2>Desbloqueie novos poderes</h2>
    </div> -->
    <TitlePrimary :texto="'Desbloqueie novos poderes'" class="w-full mb-8"/>

    <div class="w-full flex flex-col items-center gap-10">
      <PowerCard :titulo="'Mente Estratégica'" :texto="'Desenvolva o raciocínio lógico, o pensamento crítico e a capacidade de resolver problemas enquanto enfrenta novos desafios.'">
        <template #icon><Brain :size="20"/></template>
      </PowerCard>
      
      <PowerCard :titulo="'Olhar Cientista'" :texto="'Conecte teoria e prática, descubra como a ciência aparece no cotidiano e transforme curiosidade em conhecimento.'">
        <template #icon><HatGlasses :size="20"/></template>
      </PowerCard>
      
      <PowerCard :titulo="'Visão Expandida'" :texto="'Olimpíadas podem abrir portas para medalhas, reconhecimento, viagens, bolsas de estudo e novas oportunidades acadêmicas.'">
        <template #icon><Eye :size="20"/></template>
      </PowerCard>
    </div>
  </section>

  <section class="mb-8">
    <!-- bg-[url(/nuvem-cut.svg)] bg-top bg-contain bg-no-repeat -->
    <img src="/cloud-bg-cut.svg" alt="" class="w-full">
    <!-- /nuvem-cut.svg -->
    <div class="bg-linear-to-b from-elorepx-purple-700 via-elorepx-purple-600 to-elorepx-purple-500 w-full px-5 pb-5 flex flex-col items-center border-b">
      <h3 class="font-display text-white">MISSÃO PARA VOCÊ</h3>
      <MissionCard class="my-6"/>
    </div>
  </section>

  <ReportsSection />

  <section class="px-5">
    <TitlePrimary texto="A ciência no dia a dia"/>
    
  </section>

  <ScientistsSection />

  <button @click="handleSubmit">Sair</button>
</template>