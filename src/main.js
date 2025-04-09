import './style.css'

import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import authPlugin from './plugins/auth'
import apiPlugin from './plugins/api'

const app = createApp(App)

app.use(router)
app.use(authPlugin)
app.use(apiPlugin)
app.mount('#app')
