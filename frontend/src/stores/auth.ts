import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const isAuthenticated = computed(() => !!session.value)

  function initSessionListener() {
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
    })
  }

  async function restoreSession() {
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    user.value = data.session?.user ?? null
  }

  let sessionReadyPromise: Promise<void> | null = null

  function ensureSessionRestored() {
    if (!sessionReadyPromise) {
      sessionReadyPromise = restoreSession()
    }
    return sessionReadyPromise
  }

  async function signUp(email: string, password: string, nickname: string) {
    loading.value = true
    errorMessage.value = null

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: {nickname} }
      })
      if(error) throw error
      session.value = data.session
      user.value = data.user
      return data
    }catch(err) {
      errorMessage.value = (err as Error).message
      throw err
    }finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    errorMessage.value = null

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if(error) throw error
      session
      user.value = data.user
      return data
    }catch(err) {
      errorMessage.value = (err as Error).message
      throw err
    }finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true

    try {
      const { error } = await supabase.auth.signOut()
      console.log("saindo")
      if(error) console.warn(error.message)
    } finally {
      user.value = null
      session.value = null
      loading.value = false
    }
  }

  return {
    user,
    session,
    loading,
    errorMessage,
    isAuthenticated,
    initSessionListener,
    restoreSession,
    ensureSessionRestored,
    signUp,
    signIn,
    signOut,
  }

})