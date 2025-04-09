import { AuthClient } from '@supabase/auth-js'

const GOTRUE_URL = 'http://localhost:1227'

export default {
  install: (app) => {
    const auth = new AuthClient({ url: GOTRUE_URL })
    app.provide('auth', auth)
  }
}
