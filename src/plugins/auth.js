import { AuthClient } from '@supabase/auth-js'

const GOTRUE_URL = 'http://localhost:1227'
const API_URL = '/api'

const auth = new AuthClient({ url: GOTRUE_URL })

const apiClient = {
  async fetch(endpoint, options = {}) {
    const { data: { session } } = await auth.getSession()

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  },

  get(endpoint) {
    return this.fetch(endpoint)
  },

  post(endpoint, data) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

export default {
  install: (app) => {
    app.provide('auth', auth)
    app.provide('api', apiClient)
  }
}
