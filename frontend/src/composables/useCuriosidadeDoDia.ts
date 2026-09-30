import { onMounted, ref } from 'vue'

interface Curiosidade {
  tema: string
  texto: string
}

export function useCuriosidadeDodia() {
  const curiosidade = ref<Curiosidade | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL
      const response = await fetch(`${apiUrl}/api/curiosidade-do-dia`)
      if(!response.ok) throw new Error('Falha ao buscar curiosidade do dia')
      curiosidade.value = await response.json()
    } catch(err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  })

  return { curiosidade, loading, error }
}
