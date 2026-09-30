import { onMounted, ref } from "vue";

interface NasaApod {
  title?: string
  explanation: string
  url: string
  hdurl?: string
  media_type: 'image' | 'video'
  date: string
  copyright?: string
}

export function useNasaApod() {
  const apod = ref<NasaApod | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL
      const response = await fetch(`${apiUrl}/api/conteudo/nasa/apod`)
      if (!response.ok) throw new Error('Falha ao buscar conteúdo da NASA')
      apod.value = await response.json()
    }catch(err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  })

  return { apod, loading, error }
}