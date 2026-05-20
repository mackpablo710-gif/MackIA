import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach auth token
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-retry on 5xx and 401 (auth not ready yet)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status
    const config = err.config

    // Retry once on server errors or auth-not-ready
    if (!config._retried && (status >= 500 || status === 401 || status === 429)) {
      config._retried = true
      const delay = status === 429 ? 4000 : 2000
      await new Promise(r => setTimeout(r, delay))
      // Refresh token before retrying
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (token) config.headers.Authorization = `Bearer ${token}`
      return api(config)
    }

    const message = err.response?.data?.error ?? err.message ?? 'Error inesperado'
    return Promise.reject(new Error(message))
  }
)

export default api
