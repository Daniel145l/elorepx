<script setup lang="ts">
 import Header from '@/components/header/Header.vue';
import ApresentationSection from '@/components/sections/ApresentationSection.vue';
import { useAuthFetch } from '@/composables/useAuthFetch';
import { useSupabaseList } from '@/composables/useSupabaseList';
import { supabase } from '@/lib/supabase';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';


type Etapa = 'selecao' | 'selecao-nivel' | 'selecao-qtd-questoes' | 'respondendo' | 'resultado'

 interface Alternativa {
  id: string;
  texto: string
 }

 interface Questao {
  id: string;
  assunto: string;
  enunciado: string;
  alternativas: Alternativa[]
 }

 interface ResultadoQuestao {
  questao_id: string;
  correta: boolean;
  explicacao: string | null
 }

 interface ResultadoFinal {
  resultados: ResultadoQuestao[];
  resumoPorAssunto: Record<string, { acertos: number, total: number }>;
  totalAcertos: number;
  totalQuestoes: number
 }

 interface Olimpiada {
  id: string
  nome: string
 }

 interface Nivel {
  id: string
  nome: string
  descricao: string | null
 }

 const { items: olimpiadas } = useSupabaseList<Olimpiada>(() => 
  supabase.from('olimpiadas').select('id, nome')
)

//  const ASSUNTOS = ['Astronomia', 'Física', 'Química', 'Biologia']

 const olimpiadaEscolhida = ref<Olimpiada | null>(null)
 const niveis = ref<Nivel[]>([])
 const quantidade = ref(5)
 const OPCOES_QUANTIDADE = [5, 10, 15]

 const { authFetch } = useAuthFetch()
 const router = useRouter()

 const etapa = ref<Etapa>('selecao')
 const assuntoEscolhido = ref('')
 const questoes = ref<Questao[]>([])
 const indiceAtual = ref(0)
 const respostas = ref<Record<string, string>>({})
 const carregando = ref(false)
 const erro = ref<string | null>(null)
 const resultado = ref<ResultadoFinal | null>(null)

 const questaoAtual = computed(() => questoes.value[indiceAtual.value])
 const ehUltimaQuestao = computed(() => indiceAtual.value === questoes.value.length - 1)

 async function escolherOlimpiada(olimpiada: Olimpiada) {
  olimpiadaEscolhida.value = olimpiada
  carregando.value = true
  erro.value = null

  const { data, error } = await supabase
    .from('niveis_olimpiada')
    .select('id, nome, descricao')
    .eq('olimpiada_id', olimpiada.id)
    .order('ordem')

  carregando.value = false

  if (error) {
    erro.value = 'Não foi possível carregar os níveis.'
    return
  }

  niveis.value = data ?? []

  if (niveis.value.length === 0) {
    erro.value = `Ainda não há níveis cadastrados para ${olimpiada.nome}.`
    return
  }

  if (niveis.value.length === 1) {
    iniciarSimulado(niveis.value[0].id)
    return
  }

  // etapa.value = 'selecao-qtd-questoes'
  etapa.value = 'selecao-nivel'
 }

 async function iniciarSimulado(nivelId: string) {
  if(!olimpiadaEscolhida.value) return

  carregando.value = true
  erro.value = null

  try {
    const response = await authFetch(`/api/quiz/questoes?olimpiada_id=${olimpiadaEscolhida.value.id}&nivel_id=${nivelId}&quantidade=10`)
    // const response = await authFetch(`/api/quiz/questoes?olimpiada_id=${olimpiadaEscolhida.value.id}&nivel_id=${nivelId}&quantidade=${qtdQuestoes}`)

    if (!response.ok) throw new Error('Não foi possível carregar as questões.')

    questoes.value = await response.json()

    if (questoes.value.length === 0) {
      erro.value = `Ainda não há questões cadastradas dessa olimpíada.`
      return
    }

    indiceAtual.value = 0
    respostas.value = {}
    etapa.value = 'respondendo'
    } catch (err) {
      erro.value = (err as Error).message
    } finally {
      carregando.value = false
    }
  }

  function selecionarResposta(alternativaId: string) {
    respostas.value[questaoAtual.value.id] = alternativaId
  }

  function proximaQuestao() {
    if (ehUltimaQuestao.value) {
      finalizarSimulado()
    } else {
      indiceAtual.value++
    }
  }

  async function finalizarSimulado() {
    carregando.value = true
    erro.value = null

    try {
      const payload = {
        respostas: questoes.value.map((q) => ({
          questao_id: q.id,
          resposta_dada: respostas.value[q.id] ?? '',
        })),
      }

      const response = await authFetch('/api/quiz/corrigir', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Não foi possível corrigir o simulado.')
        resultado.value = await response.json()
        etapa.value = 'resultado'
      } catch (err) {
        erro.value = (err as Error).message
      } finally {
        carregando.value = false
      }
  }

  function voltarParaHome() {
    router.push({ name: 'home' })
  }
</script>

<template>
  <Header/>

  <ApresentationSection :text="'Desvende o universo das questões'"/>
  <!-- :text-description="'Resolver questões vai te fazer voar longe'" -->

  <div class="max-w-xl mx-auto px-4 py-8">
    <section v-if="etapa === 'selecao'">
      <h1 class="text-xl font-bold">Escolha uma olimpíada para o simulado</h1>
      <p v-if="erro" class="text-red-600 text-sm mt-2">{{ erro }}</p>

      <div class="flex flex-col gap-3 mt-4">
        <button
          v-for="olimpiada in olimpiadas"
          :key="olimpiada.id"
          :disabled="carregando"
          class="border rounded-lg px-4 py-3 text-left disabled:opacity-50"
          @click="escolherOlimpiada(olimpiada)"
        >
          {{ olimpiada.nome }}
        </button>
      </div>
    </section>

    <!-- <section v-else-if="etapa === 'selecao-qtd-questoes'">
      <h1>Escolha a quantidade de questões</h1>
      <button
          v-for="nivel in niveis"
          :key="nivel.id"
          :disabled="carregando"
          class="border rounded-lg px-4 py-3 text-left"
          @click="iniciarSimulado(nivel.id, qtdQuestoes)"
        >
          <span class="font-semibold">{{ nivel.nome }}</span>
          <span v-if="nivel.descricao" class="block text-sm text-gray-500">{{ nivel.descricao }}</span>
        </button>
    </section> -->

    <section v-else-if="etapa === 'selecao-nivel'">
      
      <h1>Escolha a quantidade de questões</h1>

      <div class="flex flex-col gap-3 mt-4">
        <button
          v-for="qtd in OPCOES_QUANTIDADE"
          :key="qtd"
          :disabled="carregando"
          class="border rounded-lg px-4 py-3 text-left"
          @click="quantidade = qtd"
        >
          {{ qtd }}
       </button>
      </div>
    
      <h1>Escolha o nível — {{ olimpiadaEscolhida?.nome }}</h1>
      <div class="flex flex-col gap-3 mt-4">
        <button
          v-for="nivel in niveis"
          :key="nivel.id"
          :disabled="carregando"
          class="border rounded-lg px-4 py-3 text-left"
          @click="iniciarSimulado(nivel.id)"
        >
          <span class="font-semibold">{{ nivel.nome }}</span>
          <span v-if="nivel.descricao" class="block text-sm text-gray-500">{{ nivel.descricao }}</span>
        </button>
      </div>
    </section>

    <!-- Respondendo -->
    <section v-else-if="etapa === 'respondendo' && questaoAtual">
      <p class="text-sm text-gray-500">
        Questão {{ indiceAtual + 1 }} de {{ questoes.length }} — {{ assuntoEscolhido }}
      </p>
      <h2 class="font-semibold mt-2 text-lg">{{ questaoAtual.enunciado }}</h2>

      <div class="flex flex-col gap-2 mt-4">
        <button
          v-for="alt in questaoAtual.alternativas"
          :key="alt.id"
          class="border rounded-lg px-4 py-2 text-left"
          :class="{ 'border-elorepx-purple-600 bg-elorepx-purple-50': respostas[questaoAtual.id] === alt.id }"
          @click="selecionarResposta(alt.id)"
        >
          {{ alt.texto }}
        </button>
      </div>

      <button
        class="mt-6 bg-elorepx-purple-600 text-white rounded-lg px-4 py-2 disabled:opacity-50"
        :disabled="!respostas[questaoAtual.id] || carregando"
        @click="proximaQuestao"
      >
        {{ ehUltimaQuestao ? 'Finalizar' : 'Próxima' }}
      </button>
    </section>

    <!-- Resultado -->
    <section v-else-if="etapa === 'resultado' && resultado">
      <h1 class="text-xl font-bold">
        Resultado: {{ resultado.totalAcertos }} de {{ resultado.totalQuestoes }}
      </h1>

      <div v-for="(r, i) in resultado.resultados" :key="r.questao_id" class="mt-4 border-t pt-4">
        <p class="font-semibold">
          Questão {{ i + 1 }}:
          <span :class="r.correta ? 'text-green-600' : 'text-red-600'">
            {{ r.correta ? 'Acertou' : 'Errou' }}
          </span>
        </p>
        <p v-if="r.explicacao" class="text-sm text-gray-600 whitespace-pre-line mt-1">
          {{ r.explicacao }}
        </p>
      </div>

      <button class="mt-6 bg-elorepx-purple-600 text-white rounded-lg px-4 py-2" @click="voltarParaHome">
        Voltar para a Home
      </button>
    </section>

    <p v-if="carregando" class="text-sm text-gray-500 mt-4">Carregando...</p>
  </div>
</template>