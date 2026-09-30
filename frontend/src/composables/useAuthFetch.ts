import { useAuthStore } from "@/stores/auth";

export function useAuthFetch() {
  const auth = useAuthStore()
  const apiUrl = import.meta.env.VITE_API_BASE_URL

  async function authFetch(path: string, options: RequestInit = {}) {
    const token = auth.session?.access_token

    return fetch(`${apiUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  }

  return { authFetch }
}