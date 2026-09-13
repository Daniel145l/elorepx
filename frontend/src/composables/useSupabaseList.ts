import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import { onMounted, ref } from 'vue'

export function useSupabaseList<T>(
  fetcher: () => PromiseLike<PostgrestSingleResponse<T[]>>
){
  const items = ref<T[]>([]) as import('vue').Ref<T[]>
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    const { data, error: err } = await fetcher()
    if(err) {
      error.value = err.message
    }else {
      items.value = data ?? []
    }
    loading.value = false
  })

  return { items, loading, error }
}