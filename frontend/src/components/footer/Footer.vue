<!-- src/components/footer/Footer.vue -->
<script setup lang="ts">
import { links } from '@/config/links'
import { RouterLink } from 'vue-router'

const email = 'daniellucasm18@gmail.com'
const ano = new Date().getFullYear()
const mailFeedback = `mailto:${email}?subject=${encodeURIComponent('Feedback Elorepx')}`
const mailRemocao = `mailto:${email}?subject=${encodeURIComponent('Solicitação de remoção de conteúdo - Elorepx')}`
</script>

<template>
  <footer class="bg-elorepx-purple-950 font-inter text-sm text-white/80 mt-40">
    <div class="page-container grid gap-8 py-10 md:grid-cols-3">
      <div>
        <img src="/logo-light.svg" alt="Elorepx" class="h-8" />
        <p class="mt-3 text-white/70">
          Plataforma de incentivo e preparação para olimpíadas científicas.
        </p>
      </div>

      <nav aria-label="Navegação do rodapé">
        <h2 class="mb-3 font-bold text-white">Explorar</h2>
        <ul class="flex flex-col gap-2">
          <li v-for="l in links" :key="l.to">
            <RouterLink :to="l.to" class="hover:text-white">{{ l.texto }}</RouterLink>
          </li>
        </ul>
      </nav>

      <div>
        <h2 class="mb-3 font-bold text-white">Ajuda e transparência</h2>
        <ul class="flex flex-col gap-2">
          <!-- <li><RouterLink to="/privacidade" class="hover:text-white">Política de privacidade</RouterLink></li> -->
           <!-- TODO -->
          <li><a :href="mailFeedback" class="hover:text-white">Enviar feedback</a></li>
          <li><a :href="mailRemocao" class="hover:text-white">Solicitar remoção de conteúdo</a></li>
        </ul>
      </div>
    </div>

    <div class="border-t border-white/10">
      <div class="page-container space-y-2 py-6 text-xs text-white/60">
        <p>
          Elorepx é um projeto acadêmico independente, sem vínculo com as organizações das olimpíadas
          citadas. Confirme datas e regulamentos nos sites oficiais.
        </p>
        <p>
          Explicações e curiosidades são geradas com apoio de inteligência artificial e podem conter
          imprecisões. Biografias baseadas na Wikipédia (CC BY-SA 4.0). Imagem do dia: NASA APOD.
        </p>
        <p>© {{ ano }} Elorepx · Projeto de TCC, Engenharia de Software, Universidade Federal do Ceará</p>
      </div>
    </div>
  </footer>
</template>