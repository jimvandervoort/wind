import "./style.css";

import { createApp } from "vue";
import { AuthClient } from '@supabase/auth-js';

import App from "./App.vue";
import router from "./router";
import makeAuthPlugin from "./plugins/auth";
import makeApiPlugin from "./plugins/api";

const GOTRUE_URL = 'http://localhost:1227'
const auth = new AuthClient({ url: GOTRUE_URL })
const app = createApp(App)

app.use(router)
app.use(makeAuthPlugin(auth))
app.use(makeApiPlugin(auth))
app.mount('#app')
