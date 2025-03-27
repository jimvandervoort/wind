import { AuthClient } from '@supabase/auth-js'

const GOTRUE_URL = 'http://localhost:1227'
const auth = new AuthClient({ url: GOTRUE_URL })

export default {
  install: (app) => {
    app.config.globalProperties.$auth = auth
    app.provide('auth', auth)
  }
}
