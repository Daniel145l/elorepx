<script setup lang="ts">
 import ButtonPrimary from '@/components/buttons/ButtonPrimary.vue';
import Header from '@/components/header/Header.vue';
import ApresentationSection from '@/components/sections/ApresentationSection.vue';
import { useAuthFetch } from '@/composables/useAuthFetch';
import { useSupabaseList } from '@/composables/useSupabaseList';
import { supabase } from '@/lib/supabase';
import { computed, ref } from 'vue';


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
  assunto: string;
  resposta_correta: string
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
 const nivelEscolhido = ref<Nivel | null>(null)
 const quantidade = ref(5)
 const OPCOES_QUANTIDADE = [5, 10, 15]

 const { authFetch } = useAuthFetch()

 const etapa = ref<Etapa>('selecao')
 const questoes = ref<Questao[]>([])
 const indiceAtual = ref(0)
 const respostas = ref<Record<string, string>>({})
 const carregando = ref(false)
 const erro = ref<string | null>(null)
 const resultado = ref<ResultadoFinal | null>(null)

 const questaoAtual = computed(() => questoes.value[indiceAtual.value])
 const ehUltimaQuestao = computed(() => indiceAtual.value === questoes.value.length - 1)
 const horaInicio = ref<number | null>(null)

 const duracaoMs = ref<number>(0)

 const curiosidades = ref<Record<string, string>>({})
 const carregandoCuriosidade = ref<Record<string, boolean>>({})

 const duracaoFormatada = computed(() => {
  if(!duracaoMs.value) return ""

  const totalSegundos = Math.floor(duracaoMs.value / 1000)
  
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60

  const minutosFormatados = String(minutos).padStart(2, '0')
  const segundosFormatados = String(segundos).padStart(2, '0')

  if(minutos >= 1) {
    return `${minutosFormatados} minuto(s) e ${segundosFormatados} segundos`
  }else {
    return `${segundosFormatados} segundos`
  }
 })

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
    nivelEscolhido.value = niveis.value[0]
  }else {
    nivelEscolhido.value = null
  }

  // etapa.value = 'selecao-qtd-questoes'
  etapa.value = 'selecao-nivel'
 }

 async function iniciarSimulado(nivelId: string) {
  if(!olimpiadaEscolhida.value) return

  carregando.value = true
  erro.value = null

  try {
    const response = await authFetch(`/api/quiz/questoes?olimpiada_id=${olimpiadaEscolhida.value.id}&nivel_id=${nivelId}&quantidade=${quantidade.value}`)

    if (!response.ok) throw new Error('Não foi possível carregar as questões.')

    questoes.value = await response.json()

    if (questoes.value.length === 0) {
      erro.value = `Ainda não há questões cadastradas dessa olimpíada.`
      return
    }

    indiceAtual.value = 0
    respostas.value = {}
    etapa.value = 'respondendo'
    horaInicio.value = Date.now()

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
        duracaoMs.value = Date.now() - (horaInicio.value ?? Date.now());

      } catch (err) {
        erro.value = (err as Error).message
      } finally {
        carregando.value = false
      }
  }

  function voltarParaSimulados() {
    etapa.value = 'selecao'
    olimpiadaEscolhida.value = null
    nivelEscolhido.value = null
    niveis.value = []
    questoes.value = []
    respostas.value = {}
    resultado.value = null
    duracaoMs.value = 0
  }

  function encontrarQuestao(questaoId: string): Questao | undefined {
    return questoes.value.find((q) => q.id === questaoId)
  }

  function textoDaAlternativa(questao: Questao, alternativaId: string | undefined): string {
    if (!alternativaId) return 'Sem resposta'
    return questao.alternativas.find((a) => a.id === alternativaId)?.texto ?? 'Sem resposta'
  }

  async function buscarCuriosidade(questaoId: string, assunto: string) {
    carregandoCuriosidade.value[questaoId] = true

    try {
      const response = await authFetch('/api/ia/curiosidades', {
        method: 'POST',
        body: JSON.stringify({ assunto }),
      })

      if(!response.ok) throw new Error('Falha ao obter curiosidade.')

      const data = await response.json()

      curiosidades.value[questaoId] = data.curiosidade || data.texto || 'Curiosidade indisponível no momento.'
    }catch(err) {
      curiosidades.value[questaoId] = 'Não foi possível carregar a curiosidade.'
    }finally {
      carregandoCuriosidade.value[questaoId] = false
    }
  }

</script>

<template>
  <Header/>

  <ApresentationSection v-if="etapa != 'respondendo'" :text="'Desvende o universo das questões'"/>
  <section class="max-w-xl mx-auto px-4 py-8">

    <p v-if="erro" class="text-red-600 text-sm mt-2">{{ erro }}</p>

    <section v-if="etapa === 'selecao'" class="flex flex-col">
      <h2 class="text-lg text-white text-center bg-elorepx-purple-700 rounded-t-3xl p-3">Escolha uma olimpíada para o simulado</h2>
  
      <div class="flex flex-col gap-3 border rounded-b-3xl p-4">
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

    <section v-else-if="etapa === 'selecao-nivel'" class="flex flex-col">
      
      <h1 class="text-lg text-white text-center bg-elorepx-purple-700 rounded-t-3xl p-3" >Escolha a quantidade de questões</h1>

      <div class="flex flex-col gap-3 border rounded-b-3xl p-4">
        <button
          v-for="qtd in OPCOES_QUANTIDADE"
          :key="qtd"
          :disabled="carregando"
          class="border rounded-lg px-4 py-3 text-left"
          :class="quantidade === qtd ? 'bg-elorepx-purple-500 text-white border-elorepx-purple-950 border-2' : 'bg-transparent'"
          @click="quantidade = qtd"
        >
          {{ qtd }} questões
       </button>
      </div>
    
      <h1 class="text-lg text-white text-center bg-elorepx-purple-700 rounded-t-3xl p-3 mt-8">Escolha o nível - {{ olimpiadaEscolhida?.nome }}</h1>
      
      <div class="flex flex-col gap-3 border rounded-b-3xl p-4">
        <template v-if="niveis.length > 1">
          <button
            v-for="nivel in niveis"
            :key="nivel.id"
            :disabled="carregando"
            class="border rounded-lg px-4 py-3 text-left"
            :class="nivelEscolhido === nivel ? 'bg-elorepx-purple-500 text-white border-elorepx-purple-950 border-2' : 'bg-transparent'"
            @click="nivelEscolhido = nivel"
          >
            <span class="font-semibold">{{ nivel.nome }}</span>
            <span v-if="nivel.descricao" class="block text-sm" :class="nivelEscolhido === nivel ? 'text-gray-100' : 'text-gray-500'">{{ nivel.descricao }}</span>
          </button>
        </template>

        <div v-else-if="nivelEscolhido" class="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
          <p class="font-semibold text-elorepx-purple-700">Nível único: {{ nivelEscolhido.nome }}</p>
          <p v-if="nivelEscolhido.descricao" class="text-sm text-gray-600 mt-1">{{ nivelEscolhido.descricao }}</p>
        </div>

        <p v-if="!nivelEscolhido" class="text-center text-gray-500">*Escolha um nível para iniciar o quiz</p>
      </div>

    <ButtonPrimary
      v-if="nivelEscolhido"
      :texto="'Iniciar'"
      @click="iniciarSimulado(nivelEscolhido.id)"
      class="mt-4"
    />
    </section>

    <section v-else-if="etapa === 'respondendo' && questaoAtual">
      <p class="text-sm text-gray-500">
        Questão {{ indiceAtual + 1 }} de {{ questoes.length }} — {{ olimpiadaEscolhida?.nome }}
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

    <section v-else-if="etapa === 'resultado' && resultado">
      <h1 class="text-xl font-bold">
        Resultado: {{ resultado.totalAcertos }} de {{ resultado.totalQuestoes }}
      </h1>

      <div 
        v-if="resultado.resumoPorAssunto && Object.keys(resultado.resumoPorAssunto).length > 0" 
        class="mb-8 p-4 bg-gray-50 rounded-xl border"
      >
        <h2 class="font-bold text-md mb-3 text-gray-800">Desempenho por Assunto</h2>
        
        <div class="flex flex-col gap-3">
          <div v-for="(info, assunto) in resultado.resumoPorAssunto" :key="assunto">
            
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium text-gray-700">{{ assunto }}</span>
              <span class="text-gray-500">
                {{ info.acertos }}/{{ info.total }} ({{ Math.round((info.acertos / info.total) * 100) }}%)
              </span>
            </div>

            <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                class="h-2.5 rounded-full transition-all duration-500"
                :class="(info.acertos / info.total) >= 0.7 
                  ? 'bg-green-500' 
                  : (info.acertos / info.total) >= 0.4 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'"
                :style="{ width: `${(info.acertos / info.total) * 100}%` }"
              ></div>
            </div>

          </div>
        </div>
      </div>

      <div v-for="(r, i) in resultado.resultados" :key="r.questao_id" class="mt-4 border-t pt-4">
        <p class="font-semibold">
          Questão {{ i + 1 }}:
          <span :class="r.correta ? 'text-green-600' : 'text-red-600'">
            {{ r.correta ? 'Acertou' : 'Errou' }}
          </span>
        </p>

        <template v-if="encontrarQuestao(r.questao_id)">
          <p class="text-sm text-gray-700 mt-1">{{ encontrarQuestao(r.questao_id)!.enunciado }}</p>

          <p v-if="!r.correta" class="text-sm mt-1">
            Sua resposta:
            <span class="text-red-600">{{ textoDaAlternativa(encontrarQuestao(r.questao_id)!, respostas[r.questao_id]) }}</span>
          </p>

          <p class="text-sm mt-1">
            Resposta correta:
            <span class="text-green-600">{{ textoDaAlternativa(encontrarQuestao(r.questao_id)!, r.resposta_correta) }}</span>
          </p>
        </template>

        <p v-if="r.explicacao" class="text-sm text-gray-600 whitespace-pre-line mt-1">
          {{ r.explicacao }}
        </p>

        <div class="mt-3">
          <!-- Botão visível enquanto a curiosidade ainda não foi buscada nem está carregando -->
          <button 
            v-if="!curiosidades[r.questao_id] && !carregandoCuriosidade[r.questao_id]"
            @click="buscarCuriosidade(r.questao_id, r.assunto)"
            class="text-xs bg-purple-100 text-elorepx-purple-700 px-3 py-1.5 rounded-md hover:bg-purple-200 transition-colors font-medium flex items-center gap-1"
          >
            <span>💡 Onde isso aparece no cotidiano?</span>
          </button>

          <!-- Indicador visual de carregamento (RNF-06: Usabilidade durante resposta do LLM) -->
          <p v-if="carregandoCuriosidade[r.questao_id]" class="text-xs text-gray-500 animate-pulse">
            Consultando IA sobre o cotidiano...
          </p>

          <!-- Exibição do Card com a Curiosidade Retornada pela IA -->
          <div v-if="curiosidades[r.questao_id]" class="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
            <span class="font-bold text-amber-800 block mb-1">💡 Ciência no Cotidiano:</span>
            <p>{{ curiosidades[r.questao_id] }}</p>
          </div>
        </div>

      </div>

      <p>Tempo gasto: {{ duracaoFormatada }}</p>
      <button class="mt-6 bg-elorepx-purple-600 text-white rounded-lg px-4 py-2" @click="voltarParaSimulados">
        Voltar para simulados
      </button>
    </section>

    <p v-if="carregando" class="text-sm text-gray-500 mt-4 text-center">Carregando...</p>
  </section>
</template>