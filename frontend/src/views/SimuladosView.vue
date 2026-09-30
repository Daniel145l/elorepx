<script setup lang="ts">
 import ButtonPrimary from '@/components/buttons/ButtonPrimary.vue';
import Header from '@/components/header/Header.vue';
import ApresentationSection from '@/components/sections/ApresentationSection.vue';
import { useAuthFetch } from '@/composables/useAuthFetch';
import { useSupabaseList } from '@/composables/useSupabaseList';
import { supabase } from '@/lib/supabase';
import { BookMarkedIcon, Brain, ChartNoAxesCombined, Clock, FlaskConicalIcon, Hourglass, Lightbulb, MicroscopeIcon, NotebookPen, Rocket, ZapIcon } from 'lucide-vue-next';
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
    const questao = encontrarQuestao(questaoId)
    if(!questao) return

    carregandoCuriosidade.value[questaoId] = true

    try {
      const response = await authFetch('/api/ia/curiosidade', {
        method: 'POST',
        body: JSON.stringify({ tema: `${assunto}: ${questao.enunciado}` }),
      })

      if(!response.ok) throw new Error('Falha ao obter curiosidade.')

      const data = await response.json()
      curiosidades.value[questaoId] = data.curiosidade ?? 'Curiosidade indisponível no momento.'

    }catch(err) {
      curiosidades.value[questaoId] = 'Não foi possível carregar a curiosidade.'
    }finally {
      carregandoCuriosidade.value[questaoId] = false
    }
  }

</script>

<template>
  <Header/>

  <ApresentationSection v-if="etapa != 'respondendo' && etapa != 'resultado'" :text="'Desvende o universo das questões'"/>
  <section class="max-w-xl mx-auto px-4 py-8">

    <p v-if="erro" class="text-red-600 text-sm mt-2">{{ erro }}</p>

    <!-- seção para escolher a olimpíada -->
    <section v-if="etapa === 'selecao'" class="flex flex-col">
      <div class="bg-elorepx-purple-700 text-white text-center rounded-t-2xl p-4 shadow-md">
        <h2 class="text-base">Escolha uma olimpíada</h2>
        <p class="text-xs text-purple-200 mt-0.5">Selecione a olimpíada que quer praticar</p>
      </div>
  
      <div class="flex flex-col p-4 gap-3 border border-t-0 rounded-b-2xl shadow-sm">

        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="olimpiada in olimpiadas"
            :key="olimpiada.id"
            :disabled="carregando"
            class="flex flex-col items-center justify-center p-4 bg-white border-2 rounded-2xl transition-all duration-200 hover:border-purple-300 hover:shadow-md disabled:opacity-50 text-center relative"
            :class="olimpiadaEscolhida?.id === olimpiada.id 
              ? 'border-elorepx-purple-600 bg-purple-50/60 shadow-sm scale-[1.02]' 
              : 'border-gray-300 hover:bg-gray-50'"
            @click="escolherOlimpiada(olimpiada)"
          >

            <span class="text-3xl mb-2">
              <span v-if="olimpiada.nome.includes('OBA')"><Rocket /></span>
              <span v-else-if="olimpiada.nome.includes('OBFEP')"><ZapIcon /></span>
              <span v-else-if="olimpiada.nome.includes('ONC')"><MicroscopeIcon /></span>
              <span v-else><FlaskConicalIcon /></span>
            </span>
            <span class="text-gray-800 text-base">
              {{ olimpiada.nome }}
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- seção para esolher a quantidade de questões e o nível -->
    <section v-else-if="etapa === 'selecao-nivel'" class="flex flex-col gap-6">
      
      <div class="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div class="bg-elorepx-purple-700 text-white text-center p-3.5">
          <h2 class="text-base">Escolha a quantidade de questões</h2>
          <!-- <p class="text-xs text-purple-200 mt-0.5">Escolha quantas questões quer responder</p> -->
        </div>

        <div class="p-4 bg-gray-50/50">
          <div class="grid grid-cols-3 gap-2.5">
            <button
              v-for="qtd in OPCOES_QUANTIDADE"
              :key="qtd"
              :disabled="carregando"
              class="py-3 px-2 rounded-xl text-sm border-2"
              :class="quantidade === qtd 
                ? 'border-elorepx-purple-600 bg-purple-50/80 shadow-sm font-medium' 
                : 'bg-white text-gray-700 border-gray-200'"
              @click="quantidade = qtd"
            >
              {{ qtd }} questões
            </button>
          </div>
        </div>
      </div>
    
      <div class="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div class="bg-elorepx-purple-700 text-white text-center p-3.5 flex justify-between items-center px-5">
          <h2 class="text-sm font-bold">Nível - {{ olimpiadaEscolhida?.nome }}</h2>
          <button 
            @click="etapa = 'selecao'" 
            class="text-xs text-purple-200 hover:text-white underline font-medium"
          >
            Trocar olimpíada
          </button>
        </div>

        <div class="p-4 flex flex-col gap-3">
          <template v-if="niveis.length > 1">
            <button
              v-for="nivel in niveis"
              :key="nivel.id"
              :disabled="carregando"
              class="border-2 rounded-xl p-3.5 text-left transition-all flex flex-col gap-0.5"
              :class="nivelEscolhido?.id === nivel.id 
                ? 'border-elorepx-purple-600 bg-purple-50/80 shadow-sm' 
                : 'border-gray-200 hover:border-purple-200 bg-white'"
              @click="nivelEscolhido = nivel"
            >
              <div class="flex justify-between items-center">
                <span class="font-bold text-gray-800 text-sm">{{ nivel.nome }}</span>
                <span v-if="nivelEscolhido?.id === nivel.id" class="text-elorepx-purple-600 text-xs font-bold">Selecionado</span>
              </div>
              <span v-if="nivel.descricao" class="text-xs text-gray-500 leading-relaxed">{{ nivel.descricao }}</span>
            </button>
          </template>

          <!-- Nível Único -->
          <div v-else-if="nivelEscolhido" class="p-4 bg-purple-50/80 border border-purple-200 rounded-xl text-center">
            <p class="font-bold text-elorepx-purple-800 text-sm">Nível Único: {{ nivelEscolhido.nome }}</p>
            <p v-if="nivelEscolhido.descricao" class="text-xs text-gray-600 mt-1">{{ nivelEscolhido.descricao }}</p>
          </div>
        </div>
      </div>

      <!-- Botão de Ação Principal -->
      <ButtonPrimary
        v-if="nivelEscolhido"
        :texto="'Iniciar Quiz'"
        @click="iniciarSimulado(nivelEscolhido.id)"
        class="w-full py-3.5 text-base shadow-md"
      />
    </section>

    <!-- seção de resposta -->
    <section v-else-if="etapa === 'respondendo' && questaoAtual" class="flex flex-col gap-5">
      <h1 class="text-elorepx-purple-600 font-bold font-inter border-b-2 text-lg">
        {{ olimpiadaEscolhida?.nome }} - {{ nivelEscolhido?.nome }}
      </h1>
      <div class="bg-white p-4 rounded-2xl border border-gray-400 shadow-sm flex flex-col gap-3">
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-gray-500">
            Questão {{ indiceAtual + 1 }} de {{ questoes.length }}
          </span>
        </div>

        <!-- Barra de Progresso Roxa -->
        <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div 
            class="bg-elorepx-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            :style="{ width: `${((indiceAtual + 1) / questoes.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Card do Enunciado -->
      <div class="bg-white p-5 rounded-2xl border border-gray-400 shadow-sm">
        <div class="flex items-center gap-2 mb-2 text-xs font-semibold text-purple-600">
          <span><BookMarkedIcon :size="20" /></span>
          <span class="uppercase tracking-wider">{{ questaoAtual.assunto || 'Conhecimentos Gerais' }}</span>
        </div>
        <h2 class="font-bold text-elorepx-purple-950 text-base">
          {{ questaoAtual.enunciado }}
        </h2>
      </div>

      <!-- Lista de Alternativas -->
      <div class="flex flex-col gap-3">
        <button
          v-for="(alt, idx) in questaoAtual.alternativas"
          :key="alt.id"
          class="p-4 rounded-xl text-left border-2 flex items-start gap-3 relative"
          :class="respostas[questaoAtual.id] === alt.id 
            ? 'border-elorepx-purple-600 bg-purple-50/80 shadow-sm text-elorepx-purple-950 font-medium' 
            : 'border-gray-200 hover:border-purple-200 bg-white text-gray-700'"
          @click="selecionarResposta(alt.id)"
        >
          <!-- Indicador da Letra (A, B, C, D...) -->
          <span 
            class="shrink-0 w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center"
            :class="respostas[questaoAtual.id] === alt.id 
              ? 'bg-elorepx-purple-600 text-white' 
              : 'bg-gray-100 text-gray-600'"
          >
            {{ String.fromCharCode(65 + idx) }}
          </span>

          <!-- Texto da Alternativa -->
          <span class="text-sm pt-0.5 leading-relaxed grow">{{ alt.texto }}</span>
        </button>
      </div>

      <!-- Botão para Próxima Questão / Finalizar -->
      <button
        class="w-full mt-2 bg-elorepx-purple-600 hover:bg-elorepx-purple-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        :disabled="!respostas[questaoAtual.id] || carregando"
        @click="proximaQuestao"
      >
        <span>{{ ehUltimaQuestao ? 'Finalizar Simulado' : 'Próxima Questão' }}</span>
      </button>

    </section>

    <!-- seção de resultado -->
    <section v-else-if="etapa === 'resultado' && resultado" class="flex flex-col gap-6 font-inter">

      <!-- visão geral do desempenoho -->
      <div class="bg-linear-to-br from-elorepx-purple-900 to-elorepx-purple-600 text-white p-6 rounded-3xl shadow-lg flex flex-col items-center text-center relative overflow-hidden">

        <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

        <span class="text-xs tracking-widest font-base font-inter text-white mb-1">Simulado Concluído</span>
        <h1 class="text-xl font-bold font-inter mb-4">Seu Desempenho</h1>

        <div class="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 flex flex-col items-center justify-center mb-3 shadow-inner">
          <span class="text-2xl font-bold leading-none">{{ Math.round((resultado.totalAcertos / resultado.totalQuestoes) * 100) }}%</span>
          <span class="text-[10px] text-purple-200 font-base tracking-wider mt-1">Aproveitamento</span>
        </div>

        <p class="text-sm font-medium text-purple-100">
          Você acertou <strong class="text-white font-extrabold">{{ resultado.totalAcertos }}</strong> de <strong class="text-white font-extrabold">{{ resultado.totalQuestoes }}</strong> questões
        </p>

        <div v-if="duracaoFormatada" class="mt-3 flex items-center gap-1.5 px-3 py-1 bg-black/20 rounded-full text-xs font-semibold text-purple-200 border border-white/10">
          <Clock :size="15"/><span> Tempo: {{ duracaoFormatada }}</span>
        </div>
      </div>

      <div 
        v-if="resultado.resumoPorAssunto && Object.keys(resultado.resumoPorAssunto).length > 0" 
        class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
      >
        <h2 class="font-extrabold text-gray-800 text-sm mb-4 flex items-center gap-2">
          <ChartNoAxesCombined :size="20"/>
          <span>Desempenho por Assunto</span>
        </h2>

        <div class="flex flex-col gap-3.5">
          <div v-for="(info, assunto) in resultado.resumoPorAssunto" :key="assunto" class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-gray-700">{{ assunto }}</span>
              <span class="font-bold" :class="(info.acertos / info.total) >= 0.7 ? 'text-green-600' : (info.acertos / info.total) >= 0.4 ? 'text-yellow-600' : 'text-red-600'">
                {{ info.acertos }}/{{ info.total }} ({{ Math.round((info.acertos / info.total) * 100) }}%)
              </span>
            </div>

            <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div 
                class="h-2.5 rounded-full transition-all duration-500"
                :class="(info.acertos / info.total) >= 0.7 ? 'bg-green-500' : (info.acertos / info.total) >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'"
                :style="{ width: `${(info.acertos / info.total) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- DETALHAMENTO DE QUESTÃO POR QUESTÃO -->
      <div class="flex flex-col gap-4">
        <h2 class="font-extrabold text-gray-800 text-sm px-1 flex items-center gap-2">
          <NotebookPen :size="15"/>
          <span>Revisão do Gabarito</span>
        </h2>

        <div 
          v-for="(r, i) in resultado.resultados" 
          :key="r.questao_id" 
          class="bg-white p-5 rounded-2xl border transition-all shadow-sm flex flex-col gap-3"
          :class="r.correta ? 'border-green-200/80 bg-green-50/20' : 'border-red-200/80 bg-red-50/20'"
        >
          <!-- Cabeçalho do Card da Questão -->
          <div class="flex justify-between items-center pb-2 border-b border-gray-100">
            <span class="text-xs font-extrabold text-gray-500">Questão {{ i + 1 }}</span>
            
            <span 
              class="px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1"
              :class="r.correta ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"              
            >
            <!-- :class="r.correta ? 'border-green-700 border-2 text-green-700' : 'border-red-700 border-2 text-red-700'" -->

              <span>{{ r.correta ? 'Correta' : 'Incorreta' }}</span>
            </span>
          </div>

          <!-- Enunciado e Respostas -->
          <template v-if="encontrarQuestao(r.questao_id)">
            <p class="text-sm font-semibold text-gray-800 leading-relaxed">
              {{ encontrarQuestao(r.questao_id)!.enunciado }}
            </p>

            <div class="text-xs flex flex-col gap-1.5 mt-1 pt-2 border-t border-gray-100/60">
              <p v-if="!r.correta" class="text-red-700 border-2 border-red-700 p-2.5 rounded-lg bg-red-100">
                <span class="font-bold block text-[10px] uppercase tracking-wider text-red-500">Sua Resposta:</span>
                {{ textoDaAlternativa(encontrarQuestao(r.questao_id)!, respostas[r.questao_id]) }}
              </p>

              <p class="text-green-800 boder-green-700 p-2.5 rounded-lg border-2 bg-green-100">
                <span class="font-bold block text-[10px] uppercase tracking-wider text-green-600">Resposta Correta:</span>
                {{ textoDaAlternativa(encontrarQuestao(r.questao_id)!, r.resposta_correta) }}
              </p>
            </div>
          </template>

          <!-- Explicação Pedagógica Complementar (RF-15) -->
          <div v-if="r.explicacao" class="mt-1 p-3.5 bg-purple-50/80 rounded-xl border border-purple-100 text-xs text-purple-950">
            <span class="font-bold text-elorepx-purple-700 mb-1 flex items-center gap-1">
              <Brain :size="15"/>
              <span>Explicação do Gabarito:</span>
            </span>
            <p class="whitespace-pre-line leading-relaxed text-gray-700">{{ r.explicacao }}</p>
          </div>

          <div class="mt-1">
            <button 
              v-if="!curiosidades[r.questao_id] && !carregandoCuriosidade[r.questao_id]"
              @click="buscarCuriosidade(r.questao_id, r.assunto)"
              class="w-full text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 px-3.5 py-2.5 rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Lightbulb :size="15"/> <span> Onde isso aparece no cotidiano?</span>
            </button>

            <!-- Loading State (RNF-06) -->
            <div v-if="carregandoCuriosidade[r.questao_id]" class="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-center">
              <p class="text-xs text-amber-700 font-semibold animate-pulse flex items-center justify-center gap-2">
                <Hourglass class="animate-spin" />
                <span>Consultando IA sobre o cotidiano...</span>
              </p>
            </div>

            <!-- Conteúdo Retornado da IA -->
            <div v-if="curiosidades[r.questao_id]" class="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 shadow-sm">
              <span class="font-extrabold text-amber-800 mb-1 flex items-center gap-1">
                <Lightbulb :size="15"/>
                <span>Ciência no Cotidiano:</span>
              </span>
              <p class="leading-relaxed text-amber-950">{{ curiosidades[r.questao_id] }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Botão Voltar -->
       <ButtonPrimary 
        :texto="'Voltar para simulados'"
        class="w-full py-3 shadow-md transition-all duration-200 mt-2 mb-6"
        @click="voltarParaSimulados"
        />
        
    </section>

    <p v-if="carregando" class="text-sm text-gray-500 mt-4 text-center">Carregando...</p>
  </section>
</template>