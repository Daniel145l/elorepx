<!-- src/components/DetailModal.vue -->
<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { onBeforeUnmount, watch } from 'vue';

defineProps<{
  titulo: string
  texto: string
  fotoUrl?: string | null
  fonteUrl?: string | null
  fonteNome?: string | null
  nota?: string | null
}>()

const aberto = defineModel<boolean>({ required: true })

function fechar() {
  aberto.value = false
}

function aoApertarTecla(e: KeyboardEvent) {
  if (e.key === 'Escape') fechar()
}

watch(aberto, (valor) => {
  if (valor) {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', aoApertarTecla)
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', aoApertarTecla)
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', aoApertarTecla)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="aberto"
        class="fixed inset-0 z-50 flex items-center justify-center px-3 bg-black/60 sm:items-center sm:p-6"
        @click.self="fechar"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="titulo"
          class="flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:max-w-2xl sm:rounded-2xl"
        >
          <header class="flex items-start justify-between gap-4 border-b px-5 py-4">
            <h2 class="font-inter text-lg font-bold text-elorepx-purple-700">{{ titulo }}</h2>
            <button class="shrink-0 text-gray-500 hover:text-gray-800" aria-label="Fechar" @click="fechar">
              <X :size="22" />
            </button>
          </header>

          <div class="overflow-y-auto overscroll-contain px-5 py-5">
            <div :class="fotoUrl ? 'md:grid md:grid-cols-[220px_1fr] md:items-start md:gap-6' : ''">
              <img
                v-if="fotoUrl"
                :src="fotoUrl"
                :alt="titulo"
                class="mx-auto mb-4 h-40 w-40 rounded-xl object-cover md:mb-0 md:aspect-[3/4] md:h-auto md:w-full"
              />

              <div>
                <p class="whitespace-pre-line font-inter text-sm leading-relaxed text-gray-700">{{ texto }}</p>

                <p v-if="fonteUrl" class="mt-5 text-xs text-gray-500">
                  Fonte:
                  <a :href="fonteUrl" target="_blank" rel="noopener noreferrer" class="underline">
                    {{ fonteNome ?? fonteUrl }}
                  </a>
                  <span v-if="nota"> — {{ nota }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>